import time
import logging
import threading
from collections import defaultdict
from web3 import Web3
from config import settings

log = logging.getLogger("pot-scanner")


class BlockScanner:
    """Scans Mantle blocks and builds wallet profiles from on-chain tx data."""

    def __init__(self, rpc_url: str = None):
        self.rpc = rpc_url or settings.MANTLE_RPC_URL
        self.w3 = Web3(Web3.HTTPProvider(self.rpc))
        self._profiles = {}  # wallet -> profile dict
        self._last_scanned_block = 0
        self._running = False
        self._thread = None

    def get_profile(self, wallet: str) -> dict:
        addr = wallet.lower()
        if addr in self._profiles:
            return self._profiles[addr]
        return self._scan_wallet(addr)

    def _scan_wallet(self, wallet: str) -> dict:
        try:
            w3 = self.w3
            addr = Web3.to_checksum_address(wallet)
            tx_count = w3.eth.get_transaction_count(addr)
            balance = w3.eth.get_balance(addr)
            code = w3.eth.get_code(addr)
            is_contract = code.hex() != "0x"

            profile = {
                "wallet": wallet,
                "tx_count": tx_count,
                "balance_wei": str(balance),
                "is_contract": is_contract,
                "scanned_at": int(time.time()),
                "recent_tx": [],
            }

            if tx_count > 0 and not is_contract:
                recent = self._fetch_recent_tx(wallet)
                profile["recent_tx"] = recent
                self._profiles[wallet] = profile

            return profile
        except Exception as e:
            log.error("Scan error for %s: %s", wallet, e)
            return {"wallet": wallet, "error": str(e)}

    def _fetch_recent_tx(self, wallet: str, max_blocks: int = 200) -> list:
        addr_lower = wallet.lower()
        w3 = self.w3
        latest = w3.eth.block_number
        start = max(latest - max_blocks, 0)
        results = []

        for n in range(latest, start, -1):
            try:
                block = w3.eth.get_block(n, full_transactions=True)
                for tx in block.transactions:
                    tx_from = tx["from"].lower() if tx.get("from") else ""
                    tx_to = tx.get("to").lower() if tx.get("to") else ""
                    if addr_lower in (tx_from, tx_to):
                        results.append({
                            "hash": tx["hash"].hex(),
                            "from": tx_from,
                            "to": tx_to,
                            "value_wei": str(tx.get("value", 0)),
                            "gas": tx.get("gas", 0),
                            "gas_price": str(tx.get("gasPrice", 0)),
                            "input_len": len(tx.get("input", "0x")) // 2 - 1 if tx.get("input") else 0,
                            "block": n,
                            "timestamp": block.timestamp,
                        })
                if len(results) >= 50:
                    break
            except Exception as e:
                log.debug("Block %d error: %s", n, e)
                continue

        return results

    def start_background_scan(self, interval: float = 30.0):
        if self._running:
            return
        self._running = True
        self._thread = threading.Thread(target=self._scan_loop, args=(interval,), daemon=True)
        self._thread.start()
        log.info("Background scanner started (interval=%ds)", interval)

    def stop(self):
        self._running = False

    def _scan_loop(self, interval: float):
        w3 = self.w3
        while self._running:
            try:
                latest = w3.eth.block_number
                if self._last_scanned_block == 0:
                    self._last_scanned_block = latest - 20
                start = max(self._last_scanned_block + 1, latest - 50)
                if start >= latest:
                    time.sleep(interval)
                    continue

                for n in range(start, latest + 1):
                    block = w3.eth.get_block(n, full_transactions=True)
                    seen = set()
                    for tx in block.transactions:
                        for addr_key in ("from", "to"):
                            addr = tx.get(addr_key)
                            if addr and isinstance(addr, str):
                                addr = addr.lower()
                                if addr not in seen and len(addr) == 42:
                                    seen.add(addr)
                                    if addr not in self._profiles:
                                        profile = self._profiles.get(addr) or {
                                            "wallet": addr,
                                            "tx_count": 0,
                                            "balance_wei": "0",
                                            "is_contract": False,
                                            "recent_tx": [],
                                            "scanned_at": int(time.time()),
                                        }
                                        profile["tx_count"] = w3.eth.get_transaction_count(addr)
                                        profile["recent_tx"].append({
                                            "hash": tx["hash"].hex(),
                                            "from": tx.get("from", ""),
                                            "to": tx.get("to", ""),
                                            "gas": tx.get("gas", 0),
                                            "block": n,
                                            "timestamp": block.timestamp,
                                        })
                                        if len(profile["recent_tx"]) > 20:
                                            profile["recent_tx"] = profile["recent_tx"][-20:]
                                        self._profiles[addr] = profile

                    self._last_scanned_block = n

                log.info("Scanned blocks %d-%d, profiling %d wallets", start, latest, len(self._profiles))
            except Exception as e:
                log.error("Scan loop error: %s", e)

            time.sleep(interval)

    def get_all_profiles(self) -> dict:
        return dict(self._profiles)

    def profile_count(self) -> int:
        return len(self._profiles)

    @property
    def last_scanned_block(self) -> int:
        return self._last_scanned_block

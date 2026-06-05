"""
Contract Interaction Module.

Handles all interactions with the TripwireRegistry smart contract on Mantle.
"""

import json
import os
import logging
from web3 import Web3
from typing import Optional, Dict, Any, List
from config import settings

log = logging.getLogger("tripwire-contract")


class TripwireContract:
    """Interface for the TripwireRegistry smart contract."""

    def __init__(self):
        self.w3 = Web3(Web3.HTTPProvider(settings.MANTLE_RPC_URL))
        self.contract_address = settings.POT_REGISTRY_ADDRESS
        self.private_key = settings.ORACLE_PRIVATE_KEY
        self.oracle_address = settings.ORACLE_ADDRESS

        # Load ABI from artifacts (prefer Tripwire, fall back to legacy PoT)
        abi_path = os.path.join(
            os.path.dirname(__file__),
            "..", "..", "artifacts", "contracts",
            "TripwireRegistry.sol", "TripwireRegistry.json"
        )
        if not os.path.exists(abi_path):
            abi_path = os.path.join(
                os.path.dirname(__file__),
                "..", "..", "artifacts", "contracts",
                "PoTRegistry.sol", "PoTRegistry.json"
            )

        if os.path.exists(abi_path):
            with open(abi_path) as f:
                contract_json = json.load(f)
                self.abi = contract_json["abi"]
        else:
            self.abi = self._get_minimal_abi()

        # Initialize contract if address is set
        if self.contract_address:
            self.contract = self.w3.eth.contract(
                address=Web3.to_checksum_address(self.contract_address),
                abi=self.abi
            )
        else:
            self.contract = None

    def _get_minimal_abi(self) -> list:
        """Fallback minimal ABI for essential functions."""
        return [
            {
                "inputs": [{"name": "_wallet", "type": "address"}, {"name": "_score", "type": "uint256"}],
                "name": "verifyAgentDirect",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [{"name": "_wallet", "type": "address"}],
                "name": "getAgentScore",
                "outputs": [{"name": "", "type": "uint256"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [{"name": "_wallet", "type": "address"}],
                "name": "isVerifiedAgent",
                "outputs": [{"name": "", "type": "bool"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [{"name": "_wallet", "type": "address"}],
                "name": "isRegistered",
                "outputs": [{"name": "", "type": "bool"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [{"name": "_wallet", "type": "address"}],
                "name": "getAgentInfo",
                "outputs": [{"name": "", "type": "tuple", "components": [
                    {"name": "erc8004TokenId", "type": "uint256"},
                    {"name": "wallet", "type": "address"},
                    {"name": "status", "type": "uint8"},
                    {"name": "agenticScore", "type": "uint256"},
                    {"name": "lastHeartbeat", "type": "uint256"},
                    {"name": "heartbeatsCount", "type": "uint256"},
                    {"name": "verificationTimestamp", "type": "uint256"},
                    {"name": "lastScoreUpdate", "type": "uint256"},
                ]}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [{"name": "_wallet", "type": "address"}],
                "name": "getScoreHistory",
                "outputs": [{"name": "", "type": "tuple[]", "components": [
                    {"name": "score", "type": "uint256"},
                    {"name": "timestamp", "type": "uint256"},
                ]}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [{"name": "_wallet", "type": "address"}],
                "name": "getScoreHistoryLength",
                "outputs": [{"name": "", "type": "uint256"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "getAllAgents",
                "outputs": [{"name": "", "type": "address[]"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "getAllVerifiedAgents",
                "outputs": [{"name": "", "type": "address[]"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "getTotalAgents",
                "outputs": [{"name": "", "type": "uint256"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "getTotalVerifiedAgents",
                "outputs": [{"name": "", "type": "uint256"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "getAgentCounts",
                "outputs": [
                    {"name": "total", "type": "uint256"},
                    {"name": "verified", "type": "uint256"},
                ],
                "stateMutability": "view",
                "type": "function"
            },
        ]

    # ============ Write Functions ============

    def verify_agent_direct(self, agent_wallet: str, score: int) -> Optional[str]:
        """Register and verify an agent on-chain in one call."""
        if not self.contract or not self.private_key:
            log.warning("Contract not configured. Score not submitted on-chain.")
            return None

        try:
            tx = self.contract.functions.verifyAgentDirect(
                Web3.to_checksum_address(agent_wallet),
                score
            ).build_transaction({
                "from": self.oracle_address,
                "nonce": self.w3.eth.get_transaction_count(
                    Web3.to_checksum_address(self.oracle_address)
                ),
                "gas": 300000,
                "gasPrice": self.w3.eth.gas_price,
                "chainId": settings.MANTLE_CHAIN_ID,
            })

            signed_tx = self.w3.eth.account.sign_transaction(
                tx, self.private_key
            )
            tx_hash = self.w3.eth.send_raw_transaction(
                signed_tx.rawTransaction
            )
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)

            return receipt.transactionHash.hex()

        except Exception as e:
            log.error("Error in verifyAgentDirect: %s", e)
            return None

    # ============ View Functions ============

    def is_configured(self) -> bool:
        """Check if the contract is properly configured."""
        return (
            self.contract is not None
            and bool(self.private_key)
            and bool(self.oracle_address)
        )

    def is_registered(self, wallet: str) -> bool:
        """Check if a wallet is registered on-chain."""
        if not self.contract:
            return False
        try:
            return self.contract.functions.isRegistered(
                Web3.to_checksum_address(wallet)
            ).call()
        except Exception:
            return False

    def is_verified_agent(self, wallet: str) -> bool:
        """Check if agent is verified on-chain."""
        if not self.contract:
            return False
        try:
            return self.contract.functions.isVerifiedAgent(
                Web3.to_checksum_address(wallet)
            ).call()
        except Exception:
            return False

    def get_agent_score(self, wallet: str) -> int:
        """Query agent score from contract."""
        if not self.contract:
            return 0
        try:
            return self.contract.functions.getAgentScore(
                Web3.to_checksum_address(wallet)
            ).call()
        except Exception:
            return 0

    def get_agent_status(self, wallet: str) -> int:
        """Query agent status from contract (0=Unverified, 1=Pending, 2=Verified, 3=Rejected)."""
        if not self.contract:
            return 0
        try:
            return self.contract.functions.getAgentStatus(
                Web3.to_checksum_address(wallet)
            ).call()
        except Exception:
            return 0

    def get_agent_info(self, wallet: str) -> Optional[Dict]:
        """Get full agent info from contract."""
        if not self.contract:
            return None
        try:
            info = self.contract.functions.getAgentInfo(
                Web3.to_checksum_address(wallet)
            ).call()
            return {
                "erc8004_token_id": info[0],
                "wallet": info[1],
                "status": info[2],
                "agentic_score": info[3],
                "last_heartbeat": info[4],
                "heartbeats_count": info[5],
                "verification_timestamp": info[6],
                "last_score_update": info[7],
            }
        except Exception:
            return None

    def get_score_history(self, wallet: str) -> List[Dict]:
        """Get score history from contract."""
        if not self.contract:
            return []
        try:
            history = self.contract.functions.getScoreHistory(
                Web3.to_checksum_address(wallet)
            ).call()
            return [{"score": h[0], "timestamp": h[1]} for h in history]
        except Exception:
            return []

    def get_score_history_length(self, wallet: str) -> int:
        """Get score history length from contract."""
        if not self.contract:
            return 0
        try:
            return self.contract.functions.getScoreHistoryLength(
                Web3.to_checksum_address(wallet)
            ).call()
        except Exception:
            return 0

    def get_all_agents(self) -> List[str]:
        """Get all registered agent addresses."""
        if not self.contract:
            return []
        try:
            return self.contract.functions.getAllAgents().call()
        except Exception:
            return []

    def get_all_verified_agents(self) -> List[str]:
        """Get all verified agent addresses."""
        if not self.contract:
            return []
        try:
            return self.contract.functions.getAllVerifiedAgents().call()
        except Exception:
            return []

    def get_total_agents(self) -> int:
        """Get total number of registered agents."""
        if not self.contract:
            return 0
        try:
            return self.contract.functions.getTotalAgents().call()
        except Exception:
            return 0

    def get_total_verified_agents(self) -> int:
        """Get total number of verified agents."""
        if not self.contract:
            return 0
        try:
            return self.contract.functions.getTotalVerifiedAgents().call()
        except Exception:
            return 0

    def get_agent_counts(self) -> Dict[str, int]:
        """Get both total and verified counts in one call."""
        if not self.contract:
            return {"total": 0, "verified": 0}
        try:
            total, verified = self.contract.functions.getAgentCounts().call()
            return {"total": total, "verified": verified}
        except Exception:
            return {"total": 0, "verified": 0}

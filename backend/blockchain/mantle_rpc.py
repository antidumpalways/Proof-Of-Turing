"""
Mantle RPC interaction module.

Handles direct communication with the Mantle network.
"""
from web3 import Web3
from typing import Optional, Dict, Any
from config import settings


class MantleRPC:
    """Interface for interacting with the Mantle blockchain."""

    def __init__(self):
        self.rpc_url = settings.MANTLE_RPC_URL
        self.chain_id = settings.MANTLE_CHAIN_ID
        self.w3 = Web3(Web3.HTTPProvider(self.rpc_url))

    def is_connected(self) -> bool:
        """Check if connected to Mantle network."""
        return self.w3.is_connected()

    def get_chain_id(self) -> int:
        """Get the current chain ID."""
        return self.w3.eth.chain_id

    def get_block_number(self) -> int:
        """Get the latest block number."""
        return self.w3.eth.block_number

    def get_balance(self, address: str) -> int:
        """Get MNT balance of an address (in wei)."""
        return self.w3.eth.get_balance(Web3.to_checksum_address(address))

    def get_transaction(self, tx_hash: str) -> Optional[Dict[str, Any]]:
        """Get transaction details by hash."""
        try:
            return self.w3.eth.get_transaction(tx_hash)
        except Exception:
            return None

    def get_transaction_receipt(self, tx_hash: str) -> Optional[Dict[str, Any]]:
        """Get transaction receipt by hash."""
        try:
            return self.w3.eth.get_transaction_receipt(tx_hash)
        except Exception:
            return None

    def get_gas_price(self) -> int:
        """Get current gas price in wei."""
        return self.w3.eth.gas_price

    def to_checksum_address(self, address: str) -> str:
        """Convert address to checksum format."""
        return Web3.to_checksum_address(address)

    def is_valid_address(self, address: str) -> bool:
        """Check if an address is valid."""
        return Web3.is_address(address)

"""
Contract Interaction Module.

Handles all interactions with the PoTRegistry smart contract on Mantle.
"""
import json
import os
from web3 import Web3
from typing import Optional, Dict, Any
from config import settings


class PoTContract:
    """Interface for the PoTRegistry smart contract."""

    def __init__(self):
        self.w3 = Web3(Web3.HTTPProvider(settings.MANTLE_RPC_URL))
        self.contract_address = settings.POT_REGISTRY_ADDRESS
        self.private_key = settings.ORACLE_PRIVATE_KEY
        self.oracle_address = settings.ORACLE_ADDRESS

        # Load ABI from artifacts (created by Hardhat compilation)
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
            # Fallback minimal ABI if artifacts not available
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
                "name": "submitScore",
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
        ]

    def submit_score(self, agent_wallet: str, score: int) -> Optional[str]:
        """
        Submit a score to the PoTRegistry smart contract.

        Args:
            agent_wallet: Agent wallet address
            score: Score 0-100

        Returns:
            Transaction hash if successful, None otherwise
        """
        if not self.contract or not self.private_key:
            print("Warning: Contract not configured. Score not submitted on-chain.")
            return None

        try:
            tx = self.contract.functions.submitScore(
                Web3.to_checksum_address(agent_wallet),
                score
            ).build_transaction({
                "from": self.oracle_address,
                "nonce": self.w3.eth.get_transaction_count(
                    Web3.to_checksum_address(self.oracle_address)
                ),
                "gas": 200000,
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
            print(f"Error submitting score: {e}")
            return None

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

    def is_configured(self) -> bool:
        """Check if the contract is properly configured."""
        return (
            self.contract is not None
            and bool(self.private_key)
            and bool(self.oracle_address)
        )

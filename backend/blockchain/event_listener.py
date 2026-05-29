"""
Event Listener.

Listens for on-chain events from the PoTRegistry contract.
Listens for:
- HeartbeatReceived: When agents submit heartbeats
- AgentRegistered: When new agents register
"""
import time
import json
import os
from typing import Callable, Optional
from web3 import Web3
from config import settings


class EventListener:
    """Listen for events from the PoTRegistry contract."""

    def __init__(self):
        self.w3 = Web3(Web3.HTTPProvider(settings.MANTLE_RPC_URL))
        self.contract_address = settings.POT_REGISTRY_ADDRESS

        # Load ABI
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
            self.abi = []

        if self.contract_address and self.abi:
            self.contract = self.w3.eth.contract(
                address=Web3.to_checksum_address(self.contract_address),
                abi=self.abi
            )
        else:
            self.contract = None

        self.running = False

    def get_past_events(self, event_name: str, from_block: int, to_block: int = "latest"):
        """Get past events from the contract."""
        if not self.contract:
            return []

        try:
            event = getattr(self.contract.events, event_name, None)
            if not event:
                return []

            return event.get_logs(from_block=from_block, to_block=to_block)
        except Exception as e:
            print(f"Error getting past events: {e}")
            return []

    def listen_forever(
        self,
        on_heartbeat: Optional[Callable] = None,
        on_registration: Optional[Callable] = None,
        poll_interval: int = 12,
    ):
        """
        Continuously listen for new events.

        Args:
            on_heartbeat: Callback when HeartbeatReceived event is detected
            on_registration: Callback when AgentRegistered event is detected
            poll_interval: Seconds between polling intervals
        """
        if not self.contract:
            print("EventListener: Contract not configured. Cannot listen.")
            return

        self.running = True
        last_block = self.w3.eth.block_number

        print(f"EventListener: Starting listener from block {last_block}")

        while self.running:
            try:
                current_block = self.w3.eth.block_number

                if current_block > last_block:
                    # Process heartbeat events
                    if on_heartbeat:
                        heartbeat_events = self.get_past_events(
                            "HeartbeatReceived", last_block, current_block
                        )
                        for event in heartbeat_events:
                            on_heartbeat(event)

                    # Process registration events
                    if on_registration:
                        reg_events = self.get_past_events(
                            "AgentRegistered", last_block, current_block
                        )
                        for event in reg_events:
                            on_registration(event)

                    last_block = current_block

                time.sleep(poll_interval)

            except KeyboardInterrupt:
                break
            except Exception as e:
                print(f"EventListener error: {e}")
                time.sleep(poll_interval * 2)  # Back off on error

        self.running = False

    def stop(self):
        """Stop the event listener."""
        self.running = False

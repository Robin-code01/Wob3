#!/usr/bin/env python3
"""
Sanity check script for CourseProgressSoulbound contract.

Usage:
  python backend/scripts/web3_sanity_check.py [course_name] [module_name]

It will:
- Parse backend/.env and show duplicates/conflicts
- Connect to RPC from env (WEB3_PROVIDER_URL or RPC_URL)
- Print chain id and node client
- Check OWNER_ADDRESS / OWNER_PRIVATE_KEY consistency
- Query contract getters `courseNames(courseId)` and `courseModuleRequired(courseId,moduleId)` for provided course/module

"""
import os
import re
import sys
import json
from pathlib import Path
from web3 import Web3
from eth_account import Account

ENV_PATH = Path(__file__).resolve().parents[1] / ".env"


def parse_env(path: Path):
    data = {}
    multi = {}
    if not path.exists():
        return data, multi
    with open(path, "r") as f:
        for raw in f:
            line = raw.strip()
            if not line or line.startswith("#"):
                continue
            # support export VAR="value" and VAR=value
            m = re.match(r'^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)=(?:"([^"]*)"|\'([^']*)\'|([^#]*))', line)
            if not m:
                continue
            key = m.group(1)
            val = m.group(2) or m.group(3) or m.group(4) or ""
            val = val.strip()
            multi.setdefault(key, []).append(val)
            data[key] = val
    return data, multi


def print_env_report(data, multi):
    print(f"Loaded env from {ENV_PATH}")
    if not data:
        print("  (no env file found)")
        return
    print("Environment keys found:")
    for k in sorted(data.keys()):
        print(f"  {k}={data[k]}")
    # duplicates
    dup = {k: v for k, v in multi.items() if len(v) > 1}
    if dup:
        print('\nDuplicate/conflicting definitions detected (last value used):')
        for k, vals in dup.items():
            print(f"  {k}: values={vals}")


MINIMAL_ABI = [
    {
        "inputs": [{"internalType": "bytes32", "name": "", "type": "bytes32"}],
        "name": "courseNames",
        "outputs": [{"internalType": "string", "name": "", "type": "string"}],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "inputs": [
            {"internalType": "bytes32", "name": "", "type": "bytes32"},
            {"internalType": "bytes32", "name": "", "type": "bytes32"},
        ],
        "name": "courseModuleRequired",
        "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
        "stateMutability": "view",
        "type": "function",
    },
]


def main():
    data, multi = parse_env(ENV_PATH)
    print_env_report(data, multi)

    provider = os.getenv("WEB3_PROVIDER_URL") or os.getenv("RPC_URL") or data.get("WEB3_PROVIDER_URL") or data.get("RPC_URL")
    contract_address = os.getenv("COURSE_MODULE_SOULBOUND_ADDRESS") or data.get("COURSE_MODULE_SOULBOUND_ADDRESS")
    owner_addr = os.getenv("OWNER_ADDRESS") or data.get("OWNER_ADDRESS")
    owner_key = os.getenv("OWNER_PRIVATE_KEY") or data.get("OWNER_PRIVATE_KEY")

    if not provider:
        print("\nNo RPC provider URL found. Set WEB3_PROVIDER_URL or RPC_URL in environment or backend/.env")
        return

    print(f"\nUsing RPC: {provider}")
    w3 = Web3(Web3.HTTPProvider(provider))
    if not w3.isConnected():
        print("Failed to connect to provider")
        return
    print(f"Connected. chainId={w3.eth.chain_id}")
    try:
        print(f"Client version: {w3.clientVersion}")
    except Exception:
        pass

    if owner_key:
        acct = Account.from_key(owner_key)
        print(f"Derived owner address from private key: {acct.address}")
        if owner_addr:
            print(f"Owner address env: {owner_addr}")
            if acct.address.lower() != owner_addr.lower():
                print("WARNING: OWNER_PRIVATE_KEY does not match OWNER_ADDRESS")
    else:
        print("No OWNER_PRIVATE_KEY provided")

    if owner_addr:
        try:
            bal = w3.eth.get_balance(Web3.toChecksumAddress(owner_addr))
            print(f"Owner balance: {w3.fromWei(bal, 'ether')} ETH")
        except Exception as e:
            print(f"Could not fetch owner balance: {e}")

    if not contract_address:
        print("\nNo COURSE_MODULE_SOULBOUND_ADDRESS set in env/backend/.env; skipping contract checks")
        return

    try:
        contract = w3.eth.contract(address=Web3.toChecksumAddress(contract_address), abi=MINIMAL_ABI)
    except Exception as e:
        print(f"Failed to create contract object: {e}")
        return

    # If user provided course/module args, check them
    course = None
    module = None
    if len(sys.argv) >= 3:
        course = sys.argv[1]
        module = sys.argv[2]
    elif len(sys.argv) == 2:
        course = sys.argv[1]

    if course:
        course_id = w3.keccak(text=course)
        try:
            registered = contract.functions.courseNames(course_id).call()
            print(f"courseNames({course}) => '{registered}'")
        except Exception as e:
            print(f"Error reading courseNames: {e}")
        if module:
            module_id = w3.keccak(text=module)
            try:
                required = contract.functions.courseModuleRequired(course_id, module_id).call()
                print(f"courseModuleRequired({course},{module}) => {required}")
            except Exception as e:
                print(f"Error reading courseModuleRequired: {e}")
    else:
        print("\nNo course specified. To check module registration run: python web3_sanity_check.py 'Course Name' 'Module Name'")


if __name__ == '__main__':
    main()

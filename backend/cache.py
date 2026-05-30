import time
import logging
from functools import wraps

log = logging.getLogger("pot-cache")


class MemoryCache:
    def __init__(self, default_ttl: int = 60):
        self._store = {}
        self._ttl = default_ttl

    def get(self, key: str):
        entry = self._store.get(key)
        if entry is None:
            return None
        if time.time() > entry["expires"]:
            del self._store[key]
            return None
        return entry["value"]

    def set(self, key: str, value, ttl: int = None):
        self._store[key] = {
            "value": value,
            "expires": time.time() + (ttl or self._ttl),
        }

    def delete(self, key: str):
        self._store.pop(key, None)

    def clear(self):
        self._store.clear()

    def __len__(self):
        now = time.time()
        return sum(1 for v in self._store.values() if v["expires"] > now)


cache = MemoryCache(default_ttl=60)


def cached(ttl: int = 60):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            key_parts = [func.__name__]
            for a in args[1:]:
                key_parts.append(str(a))
            for k, v in sorted(kwargs.items()):
                key_parts.append(f"{k}={v}")
            key = ":".join(key_parts)
            result = cache.get(key)
            if result is not None:
                return result
            result = func(*args, **kwargs)
            cache.set(key, result, ttl=ttl)
            return result
        return wrapper
    return decorator


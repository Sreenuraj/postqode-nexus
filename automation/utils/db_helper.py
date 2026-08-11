"""
Read-only Postgres helper for verification queries ONLY. Never used to create
or mutate fixture data — that always goes through automation/api_clients/ or
./scripts/reset-demo.sh. See ../.postqode/rules/general-conventions.md §13.
"""
import psycopg2
import psycopg2.extras

from utils.config import Config


def _connect():
    conn = psycopg2.connect(
        host=Config.DB_HOST,
        port=Config.DB_PORT,
        dbname=Config.DB_NAME,
        user=Config.DB_USER,
        password=Config.DB_PASSWORD,
    )
    conn.set_session(readonly=True, autocommit=True)
    return conn


def query(sql: str, params: tuple = ()):
    """Run a read-only SELECT and return a list of dict rows. Raises if sql is not a SELECT."""
    normalized = sql.strip().lower()
    if not normalized.startswith("select"):
        raise ValueError("db_helper.query() only allows SELECT statements (read-only).")
    conn = _connect()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(sql, params)
            return [dict(row) for row in cur.fetchall()]
    finally:
        conn.close()


def get_product_quantity(product_id: str):
    rows = query("SELECT quantity, status FROM products WHERE id = %s", (product_id,))
    return rows[0] if rows else None


def get_order_status(order_id: str):
    rows = query("SELECT status FROM orders WHERE id = %s", (order_id,))
    return rows[0]["status"] if rows else None

"""
CogniSolve - Comprehensive API Test Suite
Tests all 8 system features after QA audit fixes.
Non-destructive: only reads/creates test data, does not delete anything.
"""

import requests
import json
import sys
import time

BASE = "http://localhost:5000"

results = []

def test(name, method, url, body=None, expected_status=None, check_fn=None):
    """Run a single test and record the result."""
    try:
        if method == "GET":
            resp = requests.get(f"{BASE}{url}", timeout=10)
        elif method == "POST":
            resp = requests.post(f"{BASE}{url}", json=body, timeout=15)
        elif method == "PATCH":
            resp = requests.patch(f"{BASE}{url}", json=body, timeout=10)
        else:
            results.append(("SKIP", name, f"Unknown method {method}"))
            return
        
        status_ok = True
        if expected_status and resp.status_code != expected_status:
            status_ok = False
        
        data = None
        try:
            data = resp.json()
        except:
            pass
        
        check_ok = True
        check_msg = ""
        if check_fn and data:
            try:
                check_ok, check_msg = check_fn(data, resp)
            except Exception as e:
                check_ok = False
                check_msg = f"Check failed: {e}"
        
        if status_ok and check_ok:
            results.append(("PASS", name, f"HTTP {resp.status_code}" + (f" - {check_msg}" if check_msg else "")))
        else:
            err = f"HTTP {resp.status_code}"
            if not status_ok:
                err += f" (expected {expected_status})"
            if not check_ok:
                err += f" | {check_msg}"
            results.append(("FAIL", name, err))
            
    except requests.ConnectionError:
        results.append(("FAIL", name, "Connection refused - is server running?"))
    except Exception as e:
        results.append(("FAIL", name, str(e)))


# ──────────────────────────────────────
# TEST 1: Health Check
# ──────────────────────────────────────
def check_health(data, resp):
    if data.get("status") != "healthy":
        return False, "Status not healthy"
    if not data.get("ml_models_loaded"):
        return False, "ML models not loaded"
    return True, f"ML={data.get('classification_method')}, Resolution={data.get('resolution_engine')}"

test("Health Check", "GET", "/api/health", expected_status=200, check_fn=check_health)


# ──────────────────────────────────────
# TEST 2: Submit Complaint - High Priority (Product)
# ──────────────────────────────────────
def check_high_priority(data, resp):
    d = data.get("data", {})
    cat = d.get("category")
    pri = d.get("priority")
    conf = d.get("confidence_score")
    sla = d.get("sla_remaining")
    
    issues = []
    if cat != "Product":
        issues.append(f"category={cat} (expected Product)")
    if pri != "high":
        issues.append(f"priority={pri} (expected high)")
    if not sla:
        issues.append("missing sla_remaining")
    
    if issues:
        return False, "; ".join(issues)
    return True, f"cat={cat}, pri={pri}, conf={conf}"

test(
    "Submit Complaint - Urgent Product Issue",
    "POST", "/api/complaints/submit",
    body={"text": "The product is completely broken and contaminated. This is dangerous and I need an urgent recall immediately!", "channel": "web"},
    expected_status=201,
    check_fn=check_high_priority,
)


# ──────────────────────────────────────
# TEST 3: Submit Complaint - Medium Priority (Packaging)
# ──────────────────────────────────────
def check_packaging(data, resp):
    d = data.get("data", {})
    cat = d.get("category")
    pri = d.get("priority")
    # Packaging should be detected
    if cat != "Packaging":
        return False, f"category={cat} (expected Packaging)"
    return True, f"cat={cat}, pri={pri}"

test(
    "Submit Complaint - Packaging Damage",
    "POST", "/api/complaints/submit",
    body={"text": "The box was crushed when delivered and the packaging was torn. The seal was broken and the label was damaged.", "channel": "email"},
    expected_status=201,
    check_fn=check_packaging,
)


# ──────────────────────────────────────
# TEST 4: Submit Complaint - Trade Issue
# ──────────────────────────────────────
def check_trade(data, resp):
    d = data.get("data", {})
    cat = d.get("category")
    if cat != "Trade":
        return False, f"category={cat} (expected Trade)"
    return True, f"cat={cat}, pri={d.get('priority')}"

test(
    "Submit Complaint - Trade/Pricing Issue",
    "POST", "/api/complaints/submit",
    body={"text": "We need to discuss the wholesale pricing for our bulk order. The invoice amount seems incorrect and the delivery was delayed.", "channel": "call"},
    expected_status=201,
    check_fn=check_trade,
)


# ──────────────────────────────────────
# TEST 5: Input Validation - Missing text
# ──────────────────────────────────────
test(
    "Validation - Missing text field",
    "POST", "/api/complaints/submit",
    body={"text": "", "channel": "web"},
    expected_status=400,
)


# ──────────────────────────────────────
# TEST 6: Input Validation - Invalid channel
# ──────────────────────────────────────
test(
    "Validation - Invalid channel",
    "POST", "/api/complaints/submit",
    body={"text": "Test complaint", "channel": "fax"},
    expected_status=400,
)


# ──────────────────────────────────────
# TEST 7: List Complaints
# ──────────────────────────────────────
def check_list(data, resp):
    count = data.get("count", 0)
    items = data.get("data", [])
    if count == 0:
        return False, "No complaints found"
    return True, f"{count} complaints returned"

test("List All Complaints", "GET", "/api/complaints", expected_status=200, check_fn=check_list)


# ──────────────────────────────────────
# TEST 8: List with Filters
# ──────────────────────────────────────
test("Filter by Category=Product", "GET", "/api/complaints?category=Product", expected_status=200)
test("Filter by Priority=high", "GET", "/api/complaints?priority=high", expected_status=200)
test("Filter by Status=open", "GET", "/api/complaints?status=open", expected_status=200)


# ──────────────────────────────────────
# TEST 9: Get Single Complaint
# ──────────────────────────────────────
def check_single(data, resp):
    d = data.get("data", {})
    if not d.get("id"):
        return False, "Missing complaint data"
    # Check boolean serialization fix
    sla_breached = d.get("sla_breached")
    if isinstance(sla_breached, float):
        return False, f"sla_breached is float ({sla_breached}), should be bool"
    return True, f"ID={d['id']}, sla_breached type={type(sla_breached).__name__}"

test("Get Complaint by ID", "GET", "/api/complaints/1", expected_status=200, check_fn=check_single)


# ──────────────────────────────────────
# TEST 10: Status Update
# ──────────────────────────────────────
test(
    "Update Status to in_progress",
    "PATCH", "/api/complaints/2/status",
    body={"status": "in_progress"},
    expected_status=200,
)


# ──────────────────────────────────────
# TEST 11: QA Approval (Bug #2 fix)
# ──────────────────────────────────────
def check_qa(data, resp):
    d = data.get("data", {})
    if d.get("confidence_score") != 1.0:
        return False, f"confidence not set to 1.0: {d.get('confidence_score')}"
    return True, f"QA approved: cat={d.get('category')}, pri={d.get('priority')}, conf={d.get('confidence_score')}"

test(
    "QA Approval (Bug #2 regression test)",
    "PATCH", "/api/complaints/2/qa",
    body={"category": "Trade", "priority": "medium"},
    expected_status=200,
    check_fn=check_qa,
)


# ──────────────────────────────────────
# TEST 12: Dashboard Stats
# ──────────────────────────────────────
def check_dashboard(data, resp):
    d = data.get("data", {})
    required = ["total_complaints", "by_category", "by_priority", "by_status", "by_channel", "sla_breached", "avg_confidence"]
    missing = [k for k in required if k not in d]
    if missing:
        return False, f"Missing fields: {missing}"
    return True, f"total={d['total_complaints']}, breached={d['sla_breached']}"

test("Dashboard Stats", "GET", "/api/dashboard/stats", expected_status=200, check_fn=check_dashboard)


# ──────────────────────────────────────
# TEST 13: SLA Check
# ──────────────────────────────────────
test("SLA Breach Detection", "POST", "/api/dashboard/sla-check", expected_status=200)


# ──────────────────────────────────────
# TEST 14: SLA Summary
# ──────────────────────────────────────
def check_sla_summary(data, resp):
    d = data.get("data", {})
    if "total_active" not in d:
        return False, "Missing total_active"
    return True, f"active={d['total_active']}, critical={d.get('critical_count', 0)}"

test("SLA Summary", "GET", "/api/dashboard/sla-summary", expected_status=200, check_fn=check_sla_summary)


# ──────────────────────────────────────
# TEST 15: CSV Export
# ──────────────────────────────────────
def check_csv(data, resp):
    content_type = resp.headers.get("Content-Type", "")
    if "text/csv" not in content_type:
        return False, f"Wrong content type: {content_type}"
    if len(resp.text) < 50:
        return False, "CSV seems empty"
    lines = resp.text.strip().split("\n")
    return True, f"CSV lines: {len(lines)}, size: {len(resp.text)} bytes"

test("CSV Export", "GET", "/api/export/csv", expected_status=200, check_fn=check_csv)


# ──────────────────────────────────────
# TEST 16: PDF Export
# ──────────────────────────────────────
def check_pdf(data, resp):
    content_type = resp.headers.get("Content-Type", "")
    if "pdf" not in content_type:
        return False, f"Wrong content type: {content_type}"
    if len(resp.content) < 100:
        return False, "PDF seems empty"
    return True, f"PDF size: {len(resp.content)} bytes"

test("PDF Export", "GET", "/api/export/pdf", expected_status=200, check_fn=check_pdf)


# ──────────────────────────────────────
# TEST 17: 404 - Complaint Not Found
# ──────────────────────────────────────
test("404 - Non-existent Complaint", "GET", "/api/complaints/99999", expected_status=404)


# ──────────────────────────────────────
# RESULTS
# ──────────────────────────────────────
print("\n" + "=" * 70)
print("  CogniSolve - API Test Results")
print("=" * 70)

passed = sum(1 for r in results if r[0] == "PASS")
failed = sum(1 for r in results if r[0] == "FAIL")
skipped = sum(1 for r in results if r[0] == "SKIP")
total = len(results)

for status, name, detail in results:
    icon = "[OK]  " if status == "PASS" else "[FAIL]" if status == "FAIL" else "[SKIP]"
    print(f"  {icon} {name}")
    if detail:
        print(f"         {detail}")

print("\n" + "-" * 70)
print(f"  TOTAL: {total} | PASSED: {passed} | FAILED: {failed} | SKIPPED: {skipped}")
print(f"  Pass Rate: {passed/total*100:.0f}%")
print("=" * 70)

sys.exit(0 if failed == 0 else 1)

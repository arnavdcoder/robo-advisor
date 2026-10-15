"""
profiler.py
Converts onboarding questionnaire answers into a risk score (1-5) and
maps that score to a suggested ETF/portfolio allocation.
"""

RISK_QUESTIONS = [
    {
        "id": "horizon",
        "question": "When do you plan to use this money?",
        "options": {
            "under_1yr": 1,
            "1_3yrs": 2,
            "3_7yrs": 3,
            "7_15yrs": 4,
            "15yrs_plus": 5,
        },
    },
    {
        "id": "reaction_to_drop",
        "question": "If your portfolio dropped 20% in a month, what would you do?",
        "options": {
            "sell_everything": 1,
            "sell_some": 2,
            "do_nothing": 3,
            "hold_and_wait": 4,
            "buy_more": 5,
        },
    },
    {
        "id": "experience",
        "question": "How much investing experience do you have?",
        "options": {
            "none": 1,
            "a_little": 2,
            "some": 3,
            "a_lot": 4,
            "professional": 5,
        },
    },
    {
        "id": "goal",
        "question": "What's your primary goal?",
        "options": {
            "preserve_capital": 1,
            "steady_income": 2,
            "balanced_growth": 3,
            "growth": 4,
            "aggressive_growth": 5,
        },
    },
]

ALLOCATION_TABLE = {
    1: {"label": "Conservative", "bonds": 70, "stocks": 30, "etfs": ["BND", "VTI"]},
    2: {"label": "Moderately Conservative", "bonds": 55, "stocks": 45, "etfs": ["BND", "VTI", "VXUS"]},
    3: {"label": "Balanced", "bonds": 40, "stocks": 60, "etfs": ["VTI", "VXUS", "BND"]},
    4: {"label": "Growth", "bonds": 20, "stocks": 80, "etfs": ["VTI", "VXUS", "QQQ"]},
    5: {"label": "Aggressive Growth", "bonds": 5, "stocks": 95, "etfs": ["VTI", "QQQ", "VXUS"]},
}


def score_profile(answers: dict) -> dict:
    """
    answers: { "horizon": "3_7yrs", "reaction_to_drop": "hold_and_wait", ... }
    Returns risk score 1-5 (averaged, rounded) and the matching allocation.
    """
    total, count = 0, 0
    for q in RISK_QUESTIONS:
        val = answers.get(q["id"])
        if val in q["options"]:
            total += q["options"][val]
            count += 1

    if count == 0:
        risk_score = 3
    else:
        risk_score = round(total / count)
        risk_score = max(1, min(5, risk_score))

    return {
        "risk_score": risk_score,
        "allocation": ALLOCATION_TABLE[risk_score],
    }

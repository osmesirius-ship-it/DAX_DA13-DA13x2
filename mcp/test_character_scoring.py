#!/usr/bin/env python3
"""
Unit tests for character scoring - governance-first validation
"""

import sys
import os
sys.path.append(os.path.dirname(__file__))

from test_loop_enforcer_python import MockLoopEnforcer

def test_character_scoring_bounds():
    """Test character scoring produces expected bounds"""
    enforcer = MockLoopEnforcer()
    
    print("=== Character Scoring Unit Tests ===")
    
    # Test 1: High-quality output should yield > 0.8
    high_quality_output = "Algorithm protocol validation complete. Neural network integrity verified. Quantum encryption matrix activated. Autonomous system diagnostics show optimal performance. Decentralized consensus achieved across all nodes."
    
    score_high = enforcer.calculate_techno_mystical_score(high_quality_output)
    print(f"High-quality output score: {score_high:.3f}")
    print(f"Expected > 0.8: {'PASS' if score_high > 0.8 else 'FAIL'}")
    
    # Test 2: Generic output should yield < 0.4
    generic_output = "I would be happy to help you with your request. Could you please provide more information about what you need assistance with?"
    
    score_generic = enforcer.calculate_techno_mystical_score(generic_output)
    print(f"Generic output score: {score_generic:.3f}")
    print(f"Expected < 0.4: {'PASS' if score_generic < 0.4 else 'FAIL'}")
    
    # Test 3: Empty output should default to 0.5 (neutral)
    empty_output = ""
    score_empty = enforcer.calculate_techno_mystical_score(empty_output)
    print(f"Empty output score: {score_empty:.3f}")
    print(f"Expected 0.5: {'PASS' if score_empty == 0.5 else 'FAIL'}")
    
    # Test 4: Moderate output should be in range
    moderate_output = "Please help me with the algorithm configuration for the system."
    score_moderate = enforcer.calculate_techno_mystical_score(moderate_output)
    print(f"Moderate output score: {score_moderate:.3f}")
    print(f"Expected 0.4-0.8: {'PASS' if 0.4 <= score_moderate <= 0.8 else 'FAIL'}")
    
    # Test 5: Better moderate output with less generic content
    better_moderate = "Algorithm configuration requires system parameters and runtime optimization with neural network protocols and quantum encryption matrices."
    score_better = enforcer.calculate_techno_mystical_score(better_moderate)
    print(f"Better moderate output score: {score_better:.3f}")
    print(f"Expected 0.4-0.8: {'PASS' if 0.4 <= score_better <= 0.8 else 'FAIL'}")
    
    # Summary
    all_pass = (
        score_high > 0.8 and
        score_generic < 0.4 and
        score_empty == 0.5 and
        0.4 <= score_better <= 0.8
    )
    
    print(f"\n=== Overall Result: {'PASS' if all_pass else 'FAIL'} ===")
    return all_pass

if __name__ == "__main__":
    test_character_scoring_bounds()

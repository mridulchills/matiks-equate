import random
import json
import itertools

def evaluate(nums, ops):
    expr = f"{nums[0]}{ops[0]}{nums[1]}{ops[1]}{nums[2]}{ops[2]}{nums[3]}"
    try:
        val = eval(expr)
        if isinstance(val, float) and not val.is_integer():
            return None
        return int(val)
    except ZeroDivisionError:
        return None

def generate_puzzle():
    while True:
        nums = [random.randint(2, 12) for _ in range(4)]
        valid_puzzles = []
        operators = ['+', '-', '*', '/']
        
        for ops in itertools.product(operators, repeat=3):
            val = evaluate(nums, ops)
            if val is not None and val > 0:
                display_ops = []
                for op in ops:
                    if op == '*': display_ops.append('×')
                    elif op == '/': display_ops.append('÷')
                    else: display_ops.append(op)
                
                valid_puzzles.append({
                    "tiles": nums,
                    "target": val,
                    "hint": display_ops
                })
        
        if valid_puzzles:
            return json.dumps(random.choice(valid_puzzles))

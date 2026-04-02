def calculate_sgpa(subjects):
    """
    Calculate Semester Grade Point Average (SGPA).
    `subjects` is expected to be a list of dictionaries, where each dict has:
      - 'credits': numeric value
      - 'grade_point': numeric value
    """
    total_credits = 0.0
    total_points = 0.0

    for subj in subjects:
        try:
            credits = float(subj.get('credits', 0))
            grade_point = float(subj.get('grade_point', 0))
            if credits > 0:
                total_credits += credits
                total_points += (credits * grade_point)
        except (ValueError, TypeError):
            continue

    if total_credits == 0:
        return 0.0
    return round(total_points / total_credits, 2)

def calculate_cgpa(semesters):
    """
    Calculate Cumulative Grade Point Average (CGPA).
    `semesters` is expected to be a list of dictionaries, where each dict has:
      - 'sgpa': numeric value
      - 'credits': numeric value
    """
    total_credits = 0.0
    total_weighted_sgpa = 0.0

    for sem in semesters:
        try:
            sgpa = float(sem.get('sgpa', 0))
            credits = float(sem.get('credits', 0))
            if credits > 0:
                total_credits += credits
                total_weighted_sgpa += (sgpa * credits)
        except (ValueError, TypeError):
            continue
            
    if total_credits == 0:
        return 0.0
    return round(total_weighted_sgpa / total_credits, 2)

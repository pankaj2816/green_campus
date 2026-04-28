from datetime import datetime, timedelta


def parse_date(value: str | None):
    if not value:
        return None
    return datetime.strptime(value, "%Y-%m-%d")


def normalize_date_range(date_from: str | None = None, date_to: str | None = None):
    start = parse_date(date_from)
    end = parse_date(date_to)
    if start and end and end < start:
        start, end = end, start
    return start, end


def apply_date_range(query, model, date_from: str | None = None, date_to: str | None = None):
    start, end = normalize_date_range(date_from, date_to)
    if start:
        query = query.filter(model.timestamp >= start)
    if end:
        query = query.filter(model.timestamp < end + timedelta(days=1))
    return query


def previous_period_range(date_from: str | None = None, date_to: str | None = None):
    start, end = normalize_date_range(date_from, date_to)
    if not start or not end:
        return None, None

    length = (end - start).days + 1
    previous_end = start - timedelta(days=1)
    previous_start = previous_end - timedelta(days=length - 1)
    return previous_start.strftime("%Y-%m-%d"), previous_end.strftime("%Y-%m-%d")

import re

# Разрешённые HTML-теги Telegram
ALLOWED_TAGS = {
    'b', 'strong', 'i', 'em', 'u', 'ins', 's', 'strike', 'del',
    'code', 'pre', 'a', 'span'
}

# Теги с разрешёнными атрибутами
ALLOWED_ATTRS = {
    'a': ['href'],
    'span': ['class'],  # только class="tg-spoiler"
}


def clean_telegram_html(text: str) -> str:
    def replace_tag(match):
        full_tag = match.group(0)
        is_closing = full_tag.startswith("</")
        tag = match.group(1).lower()

        if tag not in ALLOWED_TAGS:
            return ''  # Удалить весь тег (оставляем текст вне регекса)

        if is_closing:
            return f"</{tag}>"

        # Парсим атрибуты (если есть)
        attr_string = match.group(2) or ''
        attrs = re.findall(r'(\w+)\s*=\s*"(.*?)"', attr_string)
        allowed_attrs = []

        for attr, value in attrs:
            if attr in ALLOWED_ATTRS.get(tag, []):
                # Ограничение: только class="tg-spoiler" у <span>
                if tag == 'span' and attr == 'class' and value != 'tg-spoiler':
                    continue
                allowed_attrs.append(f'{attr}="{value}"')

        attr_str = ' ' + ' '.join(allowed_attrs) if allowed_attrs else ''
        return f"<{tag}{attr_str}>"

    # Удалим все комментарии
    text = re.sub(r'<!--.*?-->', '', text, flags=re.DOTALL)

    # Обработаем HTML-теги
    tag_pattern = re.compile(r'</?([a-zA-Z0-9]+)([^>]*)>', re.IGNORECASE)
    return tag_pattern.sub(replace_tag, text)


def format_message_to_buttons(
        message: str,
        button_texts: list[str],
        pad_char: str = '\u2800',
        max_button_length: int = 25,
        max_total_length: int = 80
) -> tuple[str, list[str]]:
    trimmed_buttons = [
        btn if len(btn) <= max_button_length else btn[:max_button_length - 3] + "..."
        for btn in button_texts
    ]

    target_length = min(
        max((len(btn) for btn in trimmed_buttons), default=0),
        max_total_length
    )

    clean_text = re.sub(r'<[^>]+>', '', message)
    clean_text = clean_text[:max_total_length]

    if len(clean_text) > target_length:
        clean_text = clean_text[:target_length]

    pad_count = max(0, target_length - len(clean_text))
    padded_message = message + pad_char * pad_count

    return padded_message, trimmed_buttons

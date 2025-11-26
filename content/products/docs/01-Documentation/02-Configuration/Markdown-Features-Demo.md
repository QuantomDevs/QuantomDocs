# Markdown Features Demo

Welcome to the Markdown Features Demo page! This document showcases the custom Markdown syntax supported on this documentation site.

---

## Warning Box

:::warning
**WORK IN PROGRESS**
This is a warning message. It highlights important information or potential issues.
Please be aware that this section is still under development.
:::

---

## Info Box

:::info
**Information Notice**
This is an informational message. It provides helpful tips or additional context.
Feel free to explore the other features!
:::

---

## Buttons

You can create buttons using a special syntax:

[Visit Quantom GitHub](https://github.com/Snenjih){.btn}
[Join Discord Server](https://discord.gg/5gdthYHqSv){.btn}

---

## Colored Text

You can highlight text with different colors:

This is some {color:accent}accent-colored text{/color}.
This is some {color:secondary}secondary-colored text{/color}.
This is some {color:warning}warning-colored text{/color}.

---

## Code Blocks with Copy Button

Code blocks now come with a convenient copy button.

```javascript
// Example JavaScript code
function greet(name) {
    console.log(`Hello, ${name}!`);
}

greet("Quantom User");
```

```python
# Example Python code
def factorial(n):
    if n == 0:
        return 1
    else:
        return n * factorial(n-1)

print(factorial(5))
```

---

## Standard Markdown Elements

### Headings

#### Sub-heading 4
##### Sub-heading 5
###### Sub-heading 6

### Paragraphs

This is a regular paragraph of text. It demonstrates how standard paragraphs are rendered. You can write multiple lines, and they will wrap naturally.

Another paragraph here.

### Lists

*   Item 1
*   Item 2
    *   Nested Item 2.1
    *   Nested Item 2.2
*   Item 3

1.  Ordered Item 1
2.  Ordered Item 2
    1.  Nested Ordered Item 2.1
    2.  Nested Ordered Item 2.2
3.  Ordered Item 3

### Links

Visit our [official website](https://example.com).

### Bold and Italic Text

This is **bold text** and this is *italic text*.
You can also use __double underscores__ for bold and _single underscores_ for italic.

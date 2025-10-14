# Steps

> Sequence content using the Steps component

Use steps to display a series of sequential actions or events. You can add as many steps as needed.

<Steps>
  <Step title="First Step">
    These are instructions or content that only pertain to the first step.
  </Step>

  <Step title="Second Step">
    These are instructions or content that only pertain to the second step.
  </Step>

  <Step title="Third Step">
    These are instructions or content that only pertain to the third step.
  </Step>
</Steps>

```mdx Steps example theme={null}
<Steps>
  <Step title="First Step">
    These are instructions or content that only pertain to the first step.
  </Step>
  <Step title="Second Step">
    These are instructions or content that only pertain to the second step.
  </Step>
  <Step title="Third Step">
    These are instructions or content that only pertain to the third step.
  </Step>
</Steps>
```

## Steps properties

<ResponseField name="children" type="ReactElement<StepProps>[]" required>
  A list of `Step` components.
</ResponseField>

<ResponseField name="titleSize" type="string" default="p">
  The size of the step titles. One of `p`, `h2`, and `h3`.
</ResponseField>

## Individual step properties

<ResponseField name="children" type="string | ReactNode" required>
  The content of a step either as plain text or components.
</ResponseField>

<ResponseField name="icon" type="string">
  The icon to display.

  Options:

  * [Font Awesome icon](https://fontawesome.com/icons) name
  * [Lucide icon](https://lucide.dev/icons) name
  * JSX-compatible SVG code wrapped in curly braces
  * URL to an externally hosted icon
  * Path to an icon file in your project

  For custom SVG icons:

  1. Convert your SVG using the [SVGR converter](https://react-svgr.com/playground/).
  2. Paste your SVG code into the SVG input field.
  3. Copy the complete `<svg>...</svg>` element from the JSX output field.
  4. Wrap the JSX-compatible SVG code in curly braces: `icon={<svg ...> ... </svg>}`.
  5. Adjust `height` and `width` as needed.
</ResponseField>

<ResponseField name="iconType" type="string">
  The [Font Awesome](https://fontawesome.com/icons) icon style. Only used with Font Awesome icons.

  Options: `regular`, `solid`, `light`, `thin`, `sharp-solid`, `duotone`, `brands`.
</ResponseField>

<ResponseField name="title" type="string">
  The title is the primary text for the step and shows up next to the indicator.
</ResponseField>

<ResponseField name="stepNumber" type="number">
  The number of the step.
</ResponseField>

<ResponseField name="titleSize" type="string" default="p">
  The size of the step titles. One of `p`, `h2`, and `h3`.
</ResponseField>






---




# Tabs

> Toggle content using the Tabs component

Use tabs to organize content into multiple panels that users can switch between. You can add any number of tabs and include other components inside each tab.

<Tabs>
  <Tab title="First tab">
    ☝️ Welcome to the content that you can only see inside the first tab.

    You can add any number of components inside of tabs. For example, a code block:

    ```java HelloWorld.java theme={null}
      class HelloWorld {
          public static void main(String[] args) {
              System.out.println("Hello, World!");
          }
      }
    ```
  </Tab>

  <Tab title="Second tab" icon="leaf">
    ✌️ Here's content that's only inside the second tab.

    This one has a <Icon icon="leaf" /> icon!
  </Tab>

  <Tab title="Third tab">
    💪 Here's content that's only inside the third tab.
  </Tab>
</Tabs>

````mdx Tabs example theme={null}
<Tabs>
  <Tab title="First tab">
    ☝️ Welcome to the content that you can only see inside the first tab.

    You can add any number of components inside of tabs. For example, a code block:
    ```java HelloWorld.java
      class HelloWorld {
          public static void main(String[] args) {
              System.out.println("Hello, World!");
          }
      }
    ```
  </Tab>
  <Tab title="Second tab" icon="leaf">
    ✌️ Here's content that's only inside the second tab.

    This one has a <Icon icon="leaf" /> icon!
  </Tab>
  <Tab title="Third tab">
    💪 Here's content that's only inside the third tab.
  </Tab>
</Tabs>
````

## Properties

<ResponseField name="title" type="string" required>
  The title of the tab. Short titles are easier to navigate.
</ResponseField>

<ResponseField name="icon" type="string">
  A [Font Awesome](https://fontawesome.com/icons) icon, [Lucide](https://lucide.dev/icons) icon, URL to an icon, or relative path to an icon.
</ResponseField>

<ResponseField name="iconType" type="string">
  For Font Awesome icons only: One of `regular`, `solid`, `light`, `thin`, `sharp-solid`, `duotone`, `brands`.
</ResponseField>










---



# Response fields

> Display API response values

The `<ResponseField>` component is designed to define the return values of an API. Many docs also use `<ResponseField>` on pages when you need to list the types of something.

<ResponseField name="response" type="string" required>
  A response field example
</ResponseField>

```mdx  theme={null}
<ResponseField name="response" type="string" required>
  A response field example
</ResponseField>
```

## Props

<ResponseField name="name" type="string" required>
  The name of the response value.
</ResponseField>

<ResponseField name="type" type="string" required>
  Expected type of the response value - this can be any arbitrary string.
</ResponseField>

<ResponseField name="default" type="string">
  The default value.
</ResponseField>

<ResponseField name="required" type="boolean">
  Show "required" beside the field name.
</ResponseField>

<ResponseField name="deprecated" type="boolean">
  Whether a field is deprecated or not.
</ResponseField>

<ResponseField name="pre" type="string[]">
  Labels that are shown before the name of the field
</ResponseField>

<ResponseField name="post" type="string[]">
  Labels that are shown after the name of the field
</ResponseField>

<RequestExample>
  ```mdx Response Field Example theme={null}
  <ResponseField name="response" type="string" required>
    A response field example
  </ResponseField>
  ```
</RequestExample>













---







# Frames

> Wrap images or other components in a container

Use frames to display images, diagrams, or other visual content with consistent styling and optional captions. Frames center content and provide visual separation from surrounding text.

<Frame>
  <img src="https://mintlify-assets.b-cdn.net/yellowstone.jpeg" alt="Photograph of a lake surrounded by trees with mountains in the distance in Yellowstone National Park." />
</Frame>

## Captions

You can add additional context to an image using the optional `caption` prop.

<Frame caption="Yosemite National Park is visited by over 3.5 million people every year">
  <img src="https://mintlify-assets.b-cdn.net/yosemite.jpg" alt="Photograph of Yosemite Valley." />
</Frame>

## Properties

<ResponseField name="caption" type="string">
  Optional caption text to show centered under your component.
</ResponseField>

<CodeGroup>
  ```mdx Frame theme={null}
  <Frame>
    <img src="/path/image.jpg" alt="Descriptive alt text" />
  </Frame>
  ```

  ```mdx Frame with a caption theme={null}
  <Frame caption="Caption text">
    <img src="/path/image.jpg" alt="Descriptive alt text" />
  </Frame>
  ```
</CodeGroup>








---








# Expandables

> Toggle to display nested properties

Use expandables to show and hide nested content within response fields. Expandables are particularly useful for displaying complex object properties in API documentation.

<ResponseField name="user" type="User Object">
  <Expandable title="properties">
    <ResponseField name="full_name" type="string">
      The full name of the user
    </ResponseField>

    <ResponseField name="is_over_21" type="boolean">
      Whether the user is over 21 years old
    </ResponseField>
  </Expandable>
</ResponseField>

```mdx Expandable example theme={null}
<ResponseField name="user" type="User Object">
  <Expandable title="properties">
    <ResponseField name="full_name" type="string">
      The full name of the user
    </ResponseField>

    <ResponseField name="is_over_21" type="boolean">
      Whether the user is over 21 years old
    </ResponseField>
  </Expandable>
</ResponseField>
```

## Properties

<ResponseField name="title" type="string">
  The name of the object you are showing.
</ResponseField>

<ResponseField name="defaultOpen" type="boolean" default="false">
  Set to `true` for the expandable to open when the page loads
</ResponseField>



---





# Columns

> Show cards side by side in a grid format

The `Columns` component lets you group multiple `Card` components together. It's most often used to put cards in a grid, by specifying the number of grid columns.

<Columns cols={2}>
  <Card title="Get started" icon="rocket">
    Set up your project with our quickstart guide.
  </Card>

  <Card title="API reference" icon="code">
    Explore endpoints, parameters, and examples for your API.
  </Card>
</Columns>

```mdx Columns example theme={null}
<Columns cols={2}>
  <Card title="Get started">
    Set up your project with our quickstart guide.
  </Card>
  <Card title="API reference">
    Explore endpoints, parameters, and examples for your API.
  </Card>
</Columns>
```

## Properties

<ResponseField name="cols" default={2}>
  The number of columns per row.
</ResponseField>









---







# Accordions

> Collapsible components to show and hide content

Accordions allow users to expand and collapse content sections. Use accordions for progressive disclosure and to organize information.

## Single accordion

<Accordion title="I am an Accordion.">
  You can put any content in here, including other components, like code:

  ```java HelloWorld.java theme={null}
   class HelloWorld {
       public static void main(String[] args) {
           System.out.println("Hello, World!");
       }
   }
  ```
</Accordion>

````mdx Accordion example theme={null}
<Accordion title="I am an Accordion.">
  You can put any content in here, including other components, like code:

   ```java HelloWorld.java
    class HelloWorld {
        public static void main(String[] args) {
            System.out.println("Hello, World!");
        }
    }
  ```
</Accordion>
````

## Accordion Groups

Group related accordions together using `<AccordionGroup>`. This creates a cohesive section of accordions that can be individually expanded or collapsed.

<AccordionGroup>
  <Accordion title="Getting started">
    You can put other components inside Accordions.

    ```java HelloWorld.java theme={null}
    class HelloWorld {
        public static void main(String[] args) {
            System.out.println("Hello, World!");
        }
    }
    ```
  </Accordion>

  <Accordion title="Advanced features" icon="bot">
    Add icons to make accordions more visually distinct and scannable.
  </Accordion>

  <Accordion title="Troubleshooting">
    Keep related content organized into groups.
  </Accordion>
</AccordionGroup>

````mdx Accordion Group Example theme={null}
<AccordionGroup>
  <Accordion title="Getting started">
    You can put other components inside Accordions.

    ```java HelloWorld.java
    class HelloWorld {
        public static void main(String[] args) {
            System.out.println("Hello, World!");
        }
    }
    ```
  </Accordion>

  <Accordion title="Advanced features" icon="alien-8bit">
    Add icons to make accordions more visually distinct and scannable.
  </Accordion>

  <Accordion title="Troubleshooting">
    Keep related content organized into groups.
  </Accordion>
</AccordionGroup>
````

## Properties

<ResponseField name="title" type="string" required>
  Title in the Accordion preview.
</ResponseField>

<ResponseField name="description" type="string">
  Detail below the title in the Accordion preview.
</ResponseField>

<ResponseField name="defaultOpen" type="boolean" default="false">
  Whether the Accordion is open by default.
</ResponseField>

<ResponseField name="icon" type="string">
  The icon to display.

  Options:

  * [Font Awesome icon](https://fontawesome.com/icons) name
  * [Lucide icon](https://lucide.dev/icons) name
  * JSX-compatible SVG code wrapped in curly braces
  * URL to an externally hosted icon
  * Path to an icon file in your project

  For custom SVG icons:

  1. Convert your SVG using the [SVGR converter](https://react-svgr.com/playground/).
  2. Paste your SVG code into the SVG input field.
  3. Copy the complete `<svg>...</svg>` element from the JSX output field.
  4. Wrap the JSX-compatible SVG code in curly braces: `icon={<svg ...> ... </svg>}`.
  5. Adjust `height` and `width` as needed.
</ResponseField>

<ResponseField name="iconType" type="string">
  The [Font Awesome](https://fontawesome.com/icons) icon style. Only used with Font Awesome icons.

  Options: `regular`, `solid`, `light`, `thin`, `sharp-solid`, `duotone`, `brands`.
</ResponseField>






---





# Callouts

> Use callouts to add eye-catching context to your content

Callouts can be styled as a Note, Warning, Info, Tip, Check, Danger, or create your own callout:

<Note>This adds a note in the content</Note>

```mdx  theme={null}
<Note>This adds a note in the content</Note>
```

<Warning>This raises a warning to watch out for</Warning>

```mdx  theme={null}
<Warning>This raises a warning to watch out for</Warning>
```

<Info>This draws attention to important information</Info>

```mdx  theme={null}
<Info>This draws attention to important information</Info>
```

<Tip>This suggests a helpful tip</Tip>

```mdx  theme={null}
<Tip>This suggests a helpful tip</Tip>
```

<Check>This brings us a checked status</Check>

```mdx  theme={null}
<Check>This brings us a checked status</Check>
```

<Danger>This is a danger callout</Danger>

```mdx  theme={null}
<Danger>This is a danger callout</Danger>
```

<Callout icon="key" color="#FFC107" iconType="regular"> This is a custom callout</Callout>

```mdx wrap theme={null}
<Callout icon="key" color="#FFC107" iconType="regular">This is a custom callout</Callout>
```



---








# Code groups

> Display multiple code examples in one component

Use the `CodeGroup` component to display multiple code blocks in a tabbed interface, allowing users to compare implementations across different programming languages or see alternative approaches for the same task.

<CodeGroup>
  ```javascript helloWorld.js theme={null}
  console.log("Hello World");
  ```

  ```python hello_world.py theme={null}
  print('Hello World!')
  ```

  ```java HelloWorld.java theme={null}
  class HelloWorld {
      public static void main(String[] args) {
          System.out.println("Hello, World!");
      }
  }
  ```
</CodeGroup>

Code groups inherit global styling from your `docs.json` file. Customize your theme using `styling.codeblocks`. See [Settings](/organize/settings#styling) for configuration options.

## Creating code groups

To create a code group, wrap multiple code blocks with `<CodeGroup>` tags. Each code block must include a title, which becomes the tab label.

````mdx  theme={null}
<CodeGroup>

```javascript helloWorld.js
console.log("Hello World");
```

```python hello_world.py
print('Hello World!')
```

```java HelloWorld.java
class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
```

</CodeGroup>
````

## Language dropdown

You can replace the tabs in a code group with a dropdown menu to toggle between languages using the `dropdown` prop.

<CodeGroup dropdown>
  ```javascript helloWorld.js theme={null}
  console.log("Hello World");
  ```

  ```python hello_world.py theme={null}
  print('Hello World!')
  ```

  ```java HelloWorld.java theme={null}
  class HelloWorld {
      public static void main(String[] args) {
          System.out.println("Hello, World!");
      }
  }
  ```
</CodeGroup>

````mdx highlight=1 theme={null}
<CodeGroup dropdown>

```javascript helloWorld.js
console.log("Hello World");
```

```python hello_world.py
print('Hello World!')
```

```java HelloWorld.java
class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
```
</CodeGroup>
````














---
















# Format code

> Display inline code and code blocks

## Adding code samples

You can add inline code snippets or code blocks. Code blocks support meta options for syntax highlighting, titles, line highlighting, icons, and more.

### Inline code

To denote a `word` or `phrase` as code, enclose it in backticks (\`).

```mdx  theme={null}
To denote a `word` or `phrase` as code, enclose it in backticks (`).
```

### Code blocks

Use [fenced code blocks](https://www.markdownguide.org/extended-syntax/#fenced-code-blocks) by enclosing code in three backticks. Code blocks are copyable, and if you have the assistant enabled, users can ask AI to explain the code.

Specify the programming language for syntax highlighting and to enable meta options. Add any meta options, like a title or icon, after the language.

<CodeGroup>
  ```java HelloWorld.java example lines icon="java" theme={null}
  class HelloWorld {
      public static void main(String[] args) {
          System.out.println("Hello, World!");
      }
  }
  ```

  ````mdx Format theme={null}
  ```java HelloWorld.java lines icon="java"
  class HelloWorld {
      public static void main(String[] args) {
          System.out.println("Hello, World!");
      }
  }
  ```
  ````
</CodeGroup>

## Code block options

You can add meta options to your code blocks to customize their appearance.

<Note>
  You must specify a programming language for a code block before adding any other meta options.
</Note>

### Option syntax

* **String and boolean options**: Wrap with `""`, `''`, or no quotes.
* **Expression options**: Wrap with `{}`, `""`, or `''`.

### Syntax highlighting

Enable syntax highlighting by specifying the programming language after the opening backticks of a code block.

We use [Shiki](https://shiki.style/) for syntax highlighting and support all available languages. See the full list of [languages](https://shiki.style/languages) in Shiki's documentation.

Customize code block themes globally using `styling.codeblocks` in your `docs.json` file. Set simple themes like `system` or `dark`, or configure custom [Shiki themes](https://shiki.style/themes) for light and dark modes. See [Settings](/organize/settings#styling) for configuration options.

<CodeGroup>
  ```java Syntax highlighting example theme={null}
  class HelloWorld {
      public static void main(String[] args) {
          System.out.println("Hello, World!");
      }
  }
  ```

  ````mdx Format theme={null}
  ```java
  class HelloWorld {
      public static void main(String[] args) {
          System.out.println("Hello, World!");
      }
  }
  ```
  ````
</CodeGroup>

### Twoslash

In JavaScript and TypeScript code blocks, use `twoslash` to enable interactive type information. Users can hover over variables, functions, and parameters to see types and errors like in an IDE.

<CodeGroup>
  ```ts twoslash Twoslash example theme={null}
  type Pet = "cat" | "dog" | "hamster";

  function adoptPet(name: string, type: Pet) {
    return `${name} the ${type} is now adopted!`;
  }

  // Hover to see the inferred types
  const message = adoptPet("Mintie", "cat");
  ```

  ````mdx Format theme={null}
  ```ts twoslash
  type Pet = "cat" | "dog" | "hamster";

  function adoptPet(name: string, type: Pet) {
    return `${name} the ${type} is now adopted!`;
  }

  // Hover to see the inferred types
  const message = adoptPet("Mintie", "cat");
  ```
  ````
</CodeGroup>

### Title

Add a title to label your code example. Use `title="Your title"` or a string on a single line.

<CodeGroup>
  ```javascript Title example theme={null}
  const hello = "world";
  ```

  ````mdx Format theme={null}
  ```javascript Title example
  const hello = "world";
  ```
  ````
</CodeGroup>

### Icon

Add an icon to your code block using the `icon` property. See [Icons](/components/icons) for all available options.

<CodeGroup>
  ```javascript Icon example icon="square-js" theme={null}
  const hello = "world";
  ```

  ````mdx Format theme={null}
  ```javascript icon="square-js"
  const hello = "world";
  ```
  ````
</CodeGroup>

### Line highlighting

Highlight specific lines in your code blocks using `highlight` with the line numbers or ranges you want to highlight.

<CodeGroup>
  ```javascript Line highlighting example highlight= {1-2,5} theme={null}
  const greeting = "Hello, World!";
  function sayHello() {
    console.log(greeting);
  }
  sayHello();
  ```

  ````mdx Format theme={null}
  ```javascript highlight={1-2,5}
  const greeting = "Hello, World!";
  function sayHello() {
    console.log(greeting);
  }
  sayHello();
  ```
  ````
</CodeGroup>

### Line focusing

Focus on specific lines in your code blocks using `focus` with line numbers or ranges.

<CodeGroup>
  ```javascript Line focus example focus= {2,4-5} theme={null}
  const greeting = "Hello, World!";
  function sayHello() {
    console.log(greeting);
  }
  sayHello();
  ```

  ````mdx Format theme={null}
  ```javascript focus={2,4-5}
  const greeting = "Hello, World!";
  function sayHello() {
    console.log(greeting);
  }
  sayHello();
  ```
  ````
</CodeGroup>

### Show line numbers

Display line numbers on the left side of your code block using `lines`.

<CodeGroup>
  ```javascript Show line numbers example lines theme={null}
  const greeting = "Hello, World!";
  function sayHello() {
    console.log(greeting);
  }
  sayHello();
  ```

  ````mdx Format theme={null}
  ```javascript lines
  const greeting = "Hello, World!";
  function sayHello() {
    console.log(greeting);
  }
  sayHello();
  ```
  ````
</CodeGroup>

### Expandable

Allow users to expand and collapse long code blocks using `expandable`.

<CodeGroup>
  ```python Expandable example expandable theme={null}
  from datetime import datetime, timedelta
  from typing import Dict, List, Optional
  from dataclasses import dataclass

  @dataclass
  class Book:
      title: str
      author: str
      isbn: str
      checked_out: bool = False
      due_date: Optional[datetime] = None

  class Library:
      def __init__(self):
          self.books: Dict[str, Book] = {}
          self.checkouts: Dict[str, List[str]] = {}  # patron -> list of ISBNs

      def add_book(self, book: Book) -> None:
          if book.isbn in self.books:
              raise ValueError(f"Book with ISBN {book.isbn} already exists")
          self.books[book.isbn] = book

      def checkout_book(self, isbn: str, patron: str, days: int = 14) -> None:
          if patron not in self.checkouts:
              self.checkouts[patron] = []

          book = self.books.get(isbn)
          if not book:
              raise ValueError("Book not found")

          if book.checked_out:
              raise ValueError("Book is already checked out")

          if len(self.checkouts[patron]) >= 3:
              raise ValueError("Patron has reached checkout limit")

          book.checked_out = True
          book.due_date = datetime.now() + timedelta(days=days)
          self.checkouts[patron].append(isbn)

      def return_book(self, isbn: str) -> float:
          book = self.books.get(isbn)
          if not book or not book.checked_out:
              raise ValueError("Book not found or not checked out")

          late_fee = 0.0
          if datetime.now() > book.due_date:
              days_late = (datetime.now() - book.due_date).days
              late_fee = days_late * 0.50

          book.checked_out = False
          book.due_date = None

          # Remove from patron's checkouts
          for patron, books in self.checkouts.items():
              if isbn in books:
                  books.remove(isbn)
                  break

          return late_fee

      def search(self, query: str) -> List[Book]:
          query = query.lower()
          return [
              book for book in self.books.values()
              if query in book.title.lower() or query in book.author.lower()
          ]

  def main():
      library = Library()

      # Add some books
      books = [
          Book("The Hobbit", "J.R.R. Tolkien", "978-0-261-10295-4"),
          Book("1984", "George Orwell", "978-0-452-28423-4"),
      ]

      for book in books:
          library.add_book(book)

      # Checkout and return example
      library.checkout_book("978-0-261-10295-4", "patron123")
      late_fee = library.return_book("978-0-261-10295-4")
      print(f"Late fee: ${late_fee:.2f}")

  if __name__ == "__main__":
      main()
  ```

  ````text Format theme={null}
  ```python expandable
  from datetime import datetime, timedelta
  from typing import Dict, List, Optional
  from dataclasses import dataclass

  # ...

  if __name__ == "__main__":
      main()
  ```
  ````
</CodeGroup>

### Wrap

Enable text wrapping for long lines using `wrap`. This prevents horizontal scrolling and makes long lines easier to read.

<CodeGroup>
  ```javascript Wrap example wrap theme={null}
  const greeting = "Hello, World! I am a long line of text that will wrap to the next line.";
  function sayHello() {
    console.log(greeting);
  }
  sayHello();
  ```

  ````mdx Format theme={null}
  ```javascript wrap
  const greeting = "Hello, World! I am a long line of text that will wrap to the next line.";
  function sayHello() {
    console.log(greeting);
  }
  sayHello();
  ```
  ````
</CodeGroup>

### Diff

Show a visual diff of added or removed lines in your code blocks. Added lines are highlighted in green and removed lines are highlighted in red.

To create diffs, add these special comments at the end of lines in your code block:

* `// [!code ++]`: Mark a line as added (green highlight).
* `// [!code --]`: Mark a line as removed (red highlight).

For multiple consecutive lines, specify the number of lines after a colon:

* `// [!code ++:3]`: Mark the current line plus the next two lines as added.
* `// [!code --:5]`: Mark the current line plus the next four lines as removed.

The comment syntax must match your programming language (for example, `//` for JavaScript or `#` for Python).

<CodeGroup>
  ```js Diff example lines theme={null}
  const greeting = "Hello, World!"; // [!code ++]
  function sayHello() {
    console.log("Hello, World!"); // [!code --]
    console.log(greeting); // [!code ++]
  }
  sayHello();
  ```

  ````text Format theme={null}
  ```js lines
  const greeting = "Hello, World!"; // [!code ++]
  function sayHello() {
    console.log("Hello, World!"); // [!code --]
    console.log(greeting); // [!code ++]
  }
  sayHello();
  ```
  ````
</CodeGroup>



---






# Format text

> Learn how to format text, create headers, and style content

## Headers

Headers organize your content and create navigation anchors. They appear in the table of contents and help users scan your documentation.

### Creating headers

Use `#` symbols to create headers of different levels:

```mdx  theme={null}
## Main section header
### Subsection header
#### Sub-subsection header
```

<Tip>
  Use descriptive, keyword-rich headers that clearly indicate the content that follows. This improves both user navigation and search engine optimization.
</Tip>

### Disabling anchor links

By default, headers include clickable anchor links that allow users to link directly to specific sections. You can disable these anchor links using the `noAnchor` prop in HTML or React headers.

<CodeGroup>
  ```mdx HTML header example theme={null}
  <h2 noAnchor>
  Header without anchor link
  </h2>
  ```

  ```mdx React header example theme={null}
  <Heading level={2} noAnchor>
  Header without anchor link
  </Heading>
  ```
</CodeGroup>

When `noAnchor` is used, the header will not display the anchor chip and clicking the header text will not copy the anchor link to the clipboard.

## Text formatting

We support most Markdown formatting for emphasizing and styling text.

### Basic formatting

Apply these formatting styles to your text:

| Style             | Syntax     | Example                | Result                 |
| ----------------- | ---------- | ---------------------- | ---------------------- |
| **Bold**          | `**text**` | `**important note**`   | **important note**     |
| *Italic*          | `_text_`   | `_emphasis_`           | *emphasis*             |
| ~~Strikethrough~~ | `~text~`   | `~deprecated feature~` | ~~deprecated feature~~ |

### Combining formats

You can combine formatting styles:

```mdx  theme={null}
**_bold and italic_**
**~~bold and strikethrough~~**
*~~italic and strikethrough~~**
```

***bold and italic***<br />
**~~bold and strikethrough~~**<br />
*~~italic and strikethrough~~*

### Superscript and subscript

For mathematical expressions or footnotes, use HTML tags:

| Type        | Syntax            | Example               | Result              |
| ----------- | ----------------- | --------------------- | ------------------- |
| Superscript | `<sup>text</sup>` | `example<sup>2</sup>` | example<sup>2</sup> |
| Subscript   | `<sub>text</sub>` | `example<sub>n</sub>` | example<sub>n</sub> |

## Links

Links help users navigate between pages and access external resources. Use descriptive link text to improve accessibility and user experience.

### Internal links

Link to other pages in your documentation using root-relative paths:

```mdx  theme={null}
[Quickstart](/quickstart)
[Steps](/components/steps)
```

[Quickstart](/quickstart)<br />
[Steps](/components/steps)

<Note>
  Avoid relative links like `[page](../page)` as they load slower and cannot be optimized as effectively as root-relative links.
</Note>

### External links

For external resources, include the full URL:

```mdx  theme={null}
[Markdown Guide](https://www.markdownguide.org/)
```

[Markdown Guide](https://www.markdownguide.org/)

### Broken links

You can check for broken links in your documentation using the [CLI](/installation):

```bash  theme={null}
mint broken-links
```

## Blockquotes

Blockquotes highlight important information, quotes, or examples within your content.

### Single line blockquotes

Add `>` before text to create a blockquote:

```mdx  theme={null}
> This is a quote that stands out from the main content.
```

> This is a quote that stands out from the main content.

### Multi-line blockquotes

For longer quotes or multiple paragraphs:

```mdx  theme={null}
> This is the first paragraph of a multi-line blockquote.
>
> This is the second paragraph, separated by an empty line with `>`.
```

> This is the first paragraph of a multi-line blockquote.
>
> This is the second paragraph, separated by an empty line with `>`.

<Tip>
  Use blockquotes sparingly to maintain their visual impact and meaning. Consider using [callouts](/components/callouts) for notes, warnings, and other information.
</Tip>

## Mathematical expressions

We support LaTeX for rendering mathematical expressions and equations.

### Inline math

Use single dollar signs, `$`, for inline mathematical expressions:

```mdx  theme={null}
The Pythagorean theorem states that $(a^2 + b^2 = c^2)$ in a right triangle.
```

The Pythagorean theorem states that $(a^2 + b^2 = c^2)$ in a right triangle.

### Block equations

Use double dollar signs, `$$`, for standalone equations:

```mdx  theme={null}
$$
E = mc^2
$$
```

$$
E = mc^2
$$

<Info>
  LaTeX support requires proper mathematical syntax. Refer to the [LaTeX documentation](https://www.latex-project.org/help/documentation/) for comprehensive syntax guidelines.
</Info>

## Line breaks and spacing

Control spacing and line breaks to improve content readability.

### Paragraph breaks

Separate paragraphs with blank lines:

```mdx  theme={null}
This is the first paragraph.

This is the second paragraph, separated by a blank line.
```

This is the first paragraph.

This is the second paragraph, separated by a blank line.

### Manual line breaks

Use HTML `<br />` tags for forced line breaks within paragraphs:

```mdx  theme={null}
This line ends here.<br />
This line starts on a new line.
```

This line ends here.<br />
This line starts on a new line.

<Tip>
  In most cases, paragraph breaks with blank lines provide better readability than manual line breaks.
</Tip>

## Best practices

### Content organization

* Use headers to create clear content hierarchy
* Follow proper header hierarchy (don't skip from H2 to H4)
* Write descriptive, keyword-rich header text

### Text formatting

* Use bold for emphasis, not for entire paragraphs
* Reserve italics for terms, titles, or subtle emphasis
* Avoid over-formatting that distracts from content

### Links

* Write descriptive link text instead of "click here" or "read more"
* Use root-relative paths for internal links
* Test links regularly to prevent broken references




---




# Images and embeds

> Add images, videos, and iframes

Add images, embed videos, and include interactive content with iframes to your documentation.

<Frame>
  <img className="rounded-xl" src="https://mintlify-assets.b-cdn.net/bigbend.jpg" alt="Photograph of a scenic landscape with purple flowers in the foreground, mountains in the background, and a blue sky with scattered clouds." />
</Frame>

## Images

Add images to provide visual context, examples, or decoration to your documentation.

### Basic image syntax

Use [Markdown syntax](https://www.markdownguide.org/basic-syntax/#images) to add images to your documentation:

```mdx  theme={null}
![Alt text describing the image](/path/to/image.png)
```

<Tip>
  Always include descriptive alt text to improve accessibility and SEO. The alt text should clearly describe what the image shows.
</Tip>

Image files must be less than 20 MB. For larger files, host them on a CDN service like [Amazon S3](https://aws.amazon.com/s3) or [Cloudinary](https://cloudinary.com).

### HTML image embeds

For more control over image display, use HTML `<img>` tags:

```html  theme={null}
<img 
  src="/images/dashboard.png" 
  alt="Main dashboard interface"
  height="300"
  className="rounded-lg"
/>
```

#### Disable zoom functionality

To disable the default zoom on click for images, add the `noZoom` property:

```html highlight="4" theme={null}
<img 
  src="/images/screenshot.png" 
  alt="Descriptive alt text"
  noZoom 
  height="200"
/>
```

#### Link images

To make an image a clickable link, wrap the image in an anchor tag and add the `noZoom` property:

```html  theme={null}
<a href="https://mintlify.com" target="_blank">
  <img 
    src="/images/logo.png" 
    alt="Mintlify logo"
    noZoom 
    height="100"
  />
</a>
```

<Note>
  Images within anchor tags automatically display a pointer cursor to indicate they are clickable.
</Note>

#### Light and dark mode images

To display different images for light and dark themes, use Tailwind CSS classes:

```html  theme={null}
<!-- Light mode image -->
<img 
  className="block dark:hidden" 
  src="/images/light-mode.png" 
  alt="Light mode interface"
/>

<!-- Dark mode image -->
<img 
  className="hidden dark:block" 
  src="/images/dark-mode.png" 
  alt="Dark mode interface"
/>
```

## Videos

Mintlify supports [HTML tags in Markdown](https://www.markdownguide.org/basic-syntax/#html), giving you flexibility to create rich content.

<Tip>
  Always include fallback text content within video elements for browsers that don't support video playback.
</Tip>

### YouTube embeds

Embed YouTube videos using iframe elements:

```html  theme={null}
<iframe
  className="w-full aspect-video rounded-xl"
  src="https://www.youtube.com/embed/4KzFe50RQkQ"
  title="YouTube video player"
  frameBorder="0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  allowFullScreen
></iframe>
```

<Frame>
  <iframe className="w-full aspect-video rounded-xl" src="https://www.youtube.com/embed/4KzFe50RQkQ" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
</Frame>

### Self-hosted videos

Use the HTML `<video>` element for self-hosted video content:

```html  theme={null}
<video
  controls
  className="w-full aspect-video rounded-xl"
  src="link-to-your-video.com"
></video>
```

### Autoplay videos

To autoplay a video, use:

```html  theme={null}
<video
  autoPlay
  muted
  loop
  playsInline
  className="w-full aspect-video rounded-xl"
  src="/videos/demo.mp4"
></video>
```

<Note>
  When using JSX syntax, write double-word attributes in camelCase: `autoPlay`, `playsInline`, `allowFullScreen`.
</Note>

## iframes

Embed external content using iframe elements:

```html  theme={null}
<iframe 
  src="https://example.com/embed" 
  title="Embedded content"
  className="w-full h-96 rounded-xl"
></iframe>
```

## Related resources

<Card title="Frame component reference" icon="frame" horizontal href="/components/frames">
  Learn how to use the Frame component for presenting images.
</Card>










---







# Lists and tables

> Display information in lists and tables

## Lists

Lists follow the official [Markdown syntax](https://www.markdownguide.org/basic-syntax/#lists-1).

### Ordered list

To create an ordered list, add numbers followed by a period before list items.

1. First item
2. Second item
3. Third item
4. Fourth item

```mdx  theme={null}
1. First item
2. Second item
3. Third item
4. Fourth item
```

### Unordered list

To create an unordered list, add dashes (`-`), asterisks (`*`), or plus signs (`+`) before list items.

* First item
* Second item
* Third item
* Fourth item

```mdx  theme={null}
- First item
- Second item
- Third item
- Fourth item
```

### Nested list

Indent list items to nest them.

* First item
* Second item
  * Additional item
  * Additional item
* Third item

```mdx  theme={null}
- First item
- Second item
  - Additional item
  - Additional item
- Third item
```

## Tables

Tables follow the official [Markdown syntax](https://www.markdownguide.org/extended-syntax/#tables).

To add a table, use three or more hyphens (`---`) to create each column's header, and use pipes (`|`) to separate each column. For compatibility, you should also add a pipe on either end of the row.

| Property | Description                           |
| -------- | ------------------------------------- |
| Name     | Full name of user                     |
| Age      | Reported age                          |
| Joined   | Whether the user joined the community |

```mdx  theme={null}
| Property | Description                           |
| -------- | ------------------------------------- |
| Name     | Full name of user                     |
| Age      | Reported age                          |
| Joined   | Whether the user joined the community |
```

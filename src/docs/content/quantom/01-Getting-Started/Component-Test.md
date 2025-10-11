# Markdown Components Test

This page demonstrates all the enhanced markdown components available in QuantomDocs.

## Callouts

<Note>
This is a note callout. Use it for general information and tips.
</Note>

<Warning>
This is a warning callout. Use it to alert users about potential issues.
</Warning>

<Info>
This is an info callout. Use it to highlight important information.
</Info>

<Tip>
This is a tip callout. Use it for helpful suggestions and best practices.
</Tip>

<Check>
This is a check callout. Use it to confirm successful actions or correct configurations.
</Check>

<Danger>
This is a danger callout. Use it for critical warnings and errors.
</Danger>

<Callout icon="rocket" color="#FFC107" iconType="fas">
This is a custom callout with a custom icon and color. You can use any FontAwesome icon!
</Callout>

## Tabs

<Tabs>
<Tab title="JavaScript" icon="code">
```javascript
console.log("Hello World");
```
</Tab>
<Tab title="Python" icon="python">
```python
print("Hello World")
```
</Tab>
<Tab title="Java" icon="java">
```java
System.out.println("Hello World");
```
</Tab>
</Tabs>

## Steps

<Steps>
<Step title="First Step">
Begin by installing the required dependencies for your project.
</Step>
<Step title="Second Step">
Configure your settings according to your environment requirements.
</Step>
<Step title="Third Step" icon="check">
Test your installation to ensure everything is working correctly.
</Step>
</Steps>

## Accordions

<Accordion title="What is Quantom?" icon="question-circle">
Quantom is a high-performance Paper fork designed for large networks and high-capacity situations.
</Accordion>

<Accordion title="Installation Guide" icon="download" defaultOpen=true>
Follow these steps to install Quantom on your server...
</Accordion>

### Accordion Group

<AccordionGroup>
<Accordion title="Frequently Asked Question 1" icon="question">
Answer to the first FAQ goes here.
</Accordion>
<Accordion title="Frequently Asked Question 2" icon="question">
Answer to the second FAQ goes here.
</Accordion>
<Accordion title="Frequently Asked Question 3" icon="question">
Answer to the third FAQ goes here.
</Accordion>
</AccordionGroup>

## Code Groups

### Tab Style

<CodeGroup>
```javascript helloWorld.js
console.log("Hello World");
```

```python hello_world.py
print("Hello World")
```

```java HelloWorld.java
System.out.println("Hello World");
```
</CodeGroup>

### Dropdown Style

<CodeGroup dropdown>
```javascript Node.js Example
const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send('Hello World');
});
```

```python Flask Example
from flask import Flask
app = Flask(__name__)

@app.route('/')
def hello():
    return 'Hello World'
```

```java Spring Boot Example
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```
</CodeGroup>

## Columns

<Columns cols={2}>
<Card title="Getting Started" icon="rocket">
Set up your project with our quickstart guide and start building amazing things.
</Card>
<Card title="API Reference" icon="code">
Explore endpoints, parameters, and examples for your API integration needs.
</Card>
<Card title="Guides" icon="book">
In-depth tutorials and best practices for common use cases and workflows.
</Card>
<Card title="Support" icon="life-ring">
Need help? Join our community or contact our support team for assistance.
</Card>
</Columns>

## Frames

<Frame caption="Screenshot of the Quantom dashboard interface">
![Quantom Dashboard](/shared/images/favicon/favicon.png)
</Frame>

## Expandables

<Expandable title="Show Advanced Configuration">
This content is hidden by default and can be expanded when needed. Perfect for optional or advanced information.

```yaml
server:
  port: 25565
  max-players: 100
  view-distance: 10
```
</Expandable>

<Expandable title="Server Requirements" defaultOpen=true>
- **CPU**: Intel Core i5 or equivalent
- **RAM**: 4GB minimum (8GB recommended)
- **Storage**: 10GB free space
- **OS**: Linux (Ubuntu 20.04+ recommended)
</Expandable>

## Response Fields

<ResponseField name="id" type="string" required>
The unique identifier for the resource.
</ResponseField>

<ResponseField name="name" type="string" required>
The display name of the resource.
</ResponseField>

<ResponseField name="created_at" type="timestamp">
The timestamp when the resource was created.
</ResponseField>

<ResponseField name="status" type="enum" default="active">
The current status of the resource. Can be: `active`, `inactive`, or `pending`.
</ResponseField>

<ResponseField name="legacy_field" type="string" deprecated>
This field is deprecated and will be removed in a future version.
</ResponseField>

## Combination Example

Here's an example combining multiple components:

<Note>
Before proceeding, make sure you have completed all the steps in the **Getting Started** guide.
</Note>

<Tabs>
<Tab title="Quick Start" icon="bolt">
<Steps>
<Step title="Download Quantom">
Download the latest version from our releases page.
</Step>
<Step title="Install">
Extract the files and run the installation script.
</Step>
<Step title="Configure">
Edit the configuration file according to your needs.
</Step>
<Step title="Start Server">
Launch your server and enjoy!
</Step>
</Steps>
</Tab>
<Tab title="Manual Installation" icon="wrench">
For advanced users who want more control over the installation process.

<Accordion title="Step-by-Step Instructions">
1. Download the JAR file
2. Create a new directory
3. Place the JAR in the directory
4. Run `java -jar quantom.jar`
</Accordion>
</Tab>
</Tabs>

<Warning>
Always backup your server before making major configuration changes!
</Warning>

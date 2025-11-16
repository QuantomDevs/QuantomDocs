# Downloads Configuration Schema Documentation

## Overview

The `downloads-config.json` file is the single source of truth for all download products and their content. This file is used by both the public downloads page and the admin management interface.

## Root Structure

```json
{
  "defaultProductId": "string",
  "products": []
}
```

### Fields

#### `defaultProductId` (required)
- **Type**: String
- **Description**: The product ID that loads when users visit `/downloads` without specifying a product
- **Format**: Must match an existing product `id` in the `products` array
- **Example**: `"quantomos-desktop"`

#### `products` (required)
- **Type**: Array of Product objects
- **Description**: List of all available download products
- **Can be empty**: Yes (but defaultProductId must be null or empty)

---

## Product Object Structure

```json
{
  "id": "unique-url-friendly-id",
  "name": "Display Name for Product",
  "modules": []
}
```

### Fields

#### `id` (required)
- **Type**: String
- **Description**: Unique identifier for the product, used in URLs
- **Format**:
  - Lowercase letters only
  - Hyphens allowed (no spaces or underscores)
  - Must be URL-safe
  - Must be unique across all products
- **Example**: `"quantomos-desktop"`, `"mobile-app"`
- **Invalid**: `"QuantomOS Desktop"`, `"quantom_os"`, `"quantom os"`

#### `name` (required)
- **Type**: String
- **Description**: Human-readable display name for the product
- **Format**: Any UTF-8 string
- **Example**: `"QuantomOS Desktop"`, `"Mobile App v2"`

#### `modules` (required)
- **Type**: Array of Module objects
- **Description**: List of content modules that make up the product page
- **Can be empty**: Yes (but page will be blank)

---

## Module Object Base Structure

All modules share these common properties:

```json
{
  "moduleId": "unique-id-within-product",
  "type": "productHeader | featureList | downloadGrid | imageBanner | textBlock",
  "position": "main | sidebar | full-width-top",
  "content": {}
}
```

### Common Fields

#### `moduleId` (required)
- **Type**: String
- **Description**: Unique identifier for this module within the product
- **Format**: Must be unique within the product's modules array
- **Example**: `"header-1"`, `"downloads-main"`, `"features-sidebar"`

#### `type` (required)
- **Type**: String (enum)
- **Description**: Determines which component to render
- **Allowed values**:
  - `"productHeader"` - Main product title and description section
  - `"featureList"` - Grid of product features
  - `"downloadGrid"` - Download buttons for different platforms
  - `"imageBanner"` - Promotional or informational image
  - `"textBlock"` - Custom text content (supports markdown)

#### `position` (required)
- **Type**: String (enum)
- **Description**: Where in the layout grid to place this module
- **Allowed values**:
  - `"full-width-top"` - Spans full page width at the top
  - `"main"` - Left column in desktop view (main content area)
  - `"sidebar"` - Right column in desktop view (secondary content)
- **Note**: On mobile, all positions stack vertically

#### `content` (required)
- **Type**: Object
- **Description**: Module-specific content data
- **Structure**: Varies by module type (see below)

---

## Module Type: Product Header

### Content Structure

```json
{
  "content": {
    "title": "Product Title",
    "description": "Product description text",
    "learnMoreUrl": "/docs/product",
    "whatsNewUrl": "/docs/changelog",
    "previewImage": "/assets/product-preview.png"
  }
}
```

### Content Fields

- **`title`** (required) - String: Product title displayed prominently
- **`description`** (required) - String: Brief product description
- **`learnMoreUrl`** (optional) - String: URL to documentation or info page
- **`whatsNewUrl`** (optional) - String: URL to changelog or release notes
- **`previewImage`** (optional) - String: URL to preview/hero image

### Best Practices
- Keep title concise (2-5 words)
- Description should be 1-2 sentences
- Use high-quality preview images (recommended: 1200x600px)
- Always place in `full-width-top` position for maximum impact

---

## Module Type: Feature List

### Content Structure

```json
{
  "content": {
    "title": "Key Features",
    "features": [
      {
        "icon": "fas fa-icon-name",
        "title": "Feature Name",
        "description": "Feature description"
      }
    ]
  }
}
```

### Content Fields

- **`title`** (required) - String: Section title
- **`features`** (required) - Array of Feature objects:
  - **`icon`** (required) - String: FontAwesome icon class
  - **`title`** (required) - String: Feature name
  - **`description`** (required) - String: Brief feature description

### Best Practices
- Use 3-6 features for best visual balance
- Keep feature titles to 2-4 words
- Descriptions should be one sentence
- Use relevant FontAwesome icons (see https://fontawesome.com/icons)

---

## Module Type: Download Grid

### Content Structure

```json
{
  "content": {
    "title": "Downloads",
    "downloads": [
      {
        "os": "Windows | macOS | Linux | Android | iOS",
        "icon": "fab fa-windows",
        "version": "1.0.0",
        "url": "/downloads/files/product-1.0.0.exe",
        "isPrimary": true,
        "beta": false
      }
    ]
  }
}
```

### Content Fields

- **`title`** (required) - String: Section title
- **`downloads`** (required) - Array of Download objects:
  - **`os`** (required) - String: Operating system name
  - **`icon`** (required) - String: FontAwesome icon class for OS
  - **`version`** (required) - String: Version number
  - **`url`** (required) - String: Download file URL
  - **`isPrimary`** (optional) - Boolean: Highlight as primary download (default: false)
  - **`beta`** (optional) - Boolean: Show beta badge (default: false)

### Best Practices
- Set `isPrimary: true` for recommended/latest stable downloads
- Use semantic versioning (e.g., "1.2.3")
- Ensure download URLs are valid and accessible
- Use appropriate OS icons:
  - Windows: `fab fa-windows`
  - macOS: `fab fa-apple`
  - Linux: `fab fa-linux`
  - Android: `fab fa-android`
  - iOS: `fab fa-app-store-ios`

---

## Module Type: Image Banner

### Content Structure

```json
{
  "content": {
    "imageUrl": "/assets/banner.png",
    "altText": "Banner description",
    "link": "/optional-link"
  }
}
```

### Content Fields

- **`imageUrl`** (required) - String: URL to image file
- **`altText`** (required) - String: Alternative text for accessibility
- **`link`** (optional) - String: URL to navigate to when clicked

### Best Practices
- Use high-quality images (recommended: 800x400px for main, 300x200px for sidebar)
- Always provide descriptive alt text for accessibility
- Optimize images for web (compress without losing quality)
- Use link sparingly (not all banners need to be clickable)

---

## Module Type: Text Block

### Content Structure

```json
{
  "content": {
    "title": "Block Title",
    "text": "Content text here",
    "supportMarkdown": true
  }
}
```

### Content Fields

- **`title`** (optional) - String: Section title/heading
- **`text`** (required) - String: Main content text
- **`supportMarkdown`** (optional) - Boolean: Parse text as Markdown (default: false)

### Best Practices
- Use markdown for rich formatting (lists, bold, italics, code blocks)
- Keep text blocks concise and scannable
- Use headings to break up longer content
- For plain text, set `supportMarkdown: false` to improve performance

### Markdown Support
When `supportMarkdown: true`, the following syntax is supported:
- **Bold**: `**text**`
- *Italic*: `*text*`
- Lists: `- item` or `1. item`
- Links: `[text](url)`
- Code: `` `code` `` or ` ```language\ncode\n``` `
- Headings: `# H1`, `## H2`, etc.

---

## Layout Positions

### full-width-top
- **Width**: Full page width
- **Typical use**: Product headers, hero sections
- **Best for**: productHeader modules
- **Mobile behavior**: Full width (same as desktop)

### main
- **Width**: ~70% of page on desktop
- **Typical use**: Primary content like downloads, detailed information
- **Best for**: downloadGrid, textBlock, imageBanner modules
- **Mobile behavior**: Full width, stacked above sidebar

### sidebar
- **Width**: ~30% of page on desktop
- **Typical use**: Supplementary content like features, quick links
- **Best for**: featureList, textBlock modules
- **Mobile behavior**: Full width, stacked below main content

---

## Validation Rules

### Product ID Validation
```javascript
function isValidProductId(id) {
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(id);
}
```

### Module ID Validation
- Must be unique within the product
- No special characters (letters, numbers, hyphens only)

### URL Validation
- Must be valid absolute or relative URLs
- Download URLs should point to accessible files
- Image URLs should point to valid image files

### Required Field Validation
- All fields marked as "required" must be present and non-empty
- Arrays cannot be empty if they are required to have items

---

## Example Complete Product

```json
{
  "id": "example-product",
  "name": "Example Product",
  "modules": [
    {
      "moduleId": "header",
      "type": "productHeader",
      "position": "full-width-top",
      "content": {
        "title": "Example Product",
        "description": "This is an example product demonstrating all features.",
        "learnMoreUrl": "/docs/example",
        "whatsNewUrl": "/docs/example/changelog",
        "previewImage": "/assets/example-preview.png"
      }
    },
    {
      "moduleId": "downloads",
      "type": "downloadGrid",
      "position": "main",
      "content": {
        "title": "Download Now",
        "downloads": [
          {
            "os": "Windows",
            "icon": "fab fa-windows",
            "version": "1.0.0",
            "url": "/downloads/files/example-1.0.0.exe",
            "isPrimary": true,
            "beta": false
          }
        ]
      }
    },
    {
      "moduleId": "features",
      "type": "featureList",
      "position": "sidebar",
      "content": {
        "title": "Features",
        "features": [
          {
            "icon": "fas fa-star",
            "title": "Amazing",
            "description": "This product is truly amazing."
          }
        ]
      }
    }
  ]
}
```

---

## Troubleshooting

### Product not loading
- Verify product ID exists in configuration
- Check that defaultProductId matches an existing product
- Ensure JSON is valid (no syntax errors)

### Module not rendering
- Verify module type is spelled correctly
- Check that all required content fields are present
- Ensure moduleId is unique within the product

### Images not showing
- Verify image URLs are correct and accessible
- Check that image files exist at specified paths
- Ensure proper file permissions

### Download links not working
- Verify download URLs are correct
- Check that download files exist and are accessible
- Ensure server routes are configured to serve download files

---

## Version History

- **v1.0.0** - Initial schema definition for Subphase 1.8

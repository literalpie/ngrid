# NGrid concepts

The core concept of `NGrid` is **simplicity**, creating a table should be simple and straight-forward.
As more features are added, complexity grows but at all times **the basic operation should remain simple**.

## Principles to Simplicity

To keep things simple we stick to the following principles:

- Simplicity through Transparency - Everything is optional (Except columns and rows) all features must come with a default behavior.
- DRY - Templates and behaviors are defined once and used throughout the application

### Simplicity through Transparency

Like others, `NGrid` comes with a lot of features. Some are native, some are built-in plugins and others are through external plugins. Extensibility
is at the core of `NGrid` as it allows opting-in to what you really need without introducing complexity of what you dont use or need.

With each feature/plugin you use the level of complexity grows, to ensure things are kept simple all of the features are transparent which means that they
should not force you to provide a value and should always come with a default behavior.

W> This is what we thrive for, it not guaranteed, especially not for 3rd party plugins. If you find a feature/plugin that does not follow this concept
please let the author know.

### DRY

DRY means *do not repeat yourself* and it's a well known principle in computer science and what drives angular (components, templates).

By assigning types to columns and templates/behaviors to types we can easily reuse templates. By using 3rd party plugins we can teach the table how to
render and react to pre-defined columns types without writing a single line of code, just apply definitions.

## The Mandatory

Ok, we have some guidelines, now what? There are 2 basic ingredients every table must have, these are *Columns* and *Rows*.  

- Columns: A collection of column definitions where each column definition defines what a cell will display (render) and how it will behave once a data is bound to it.
- Rows: A collection of data items (rows), sharing the same structure (usually).

I> To create an `NGrid` instance you only need column definitions and rows. Everything else is optional, adding more features at the cost of greater complexity.

### Column Definitions

For every column, there are **a lot** of definitions we can set. These definitions help us define how the column will look and behave in different scenarios but at the most basic level, all a column needs to know about is the path on the data item (row) to get the data from.

`NGrid` provide the factory function `columnFactory()` that help you create column definition sets, you will end up using it 99.99% of the times.

<p>Of course, simple is not enough, we love features and customization... You can read more about <a [routerLink]="['./', 'column-quickthrough']">Columns</a> and how to configure them.</p>

### Data Source (rows)

A data source has **a lot** of options which help us define how will look and behave in different scenarios but at the most basic level, all a
datasource needs to know is to return an array of data.

`NGrid` provide the factory function `createDS()` that help you create datasource instance's very easily, you will end up using it 99.99% of the times.

<p>Of course, simple is not enough, we love features and customization... You can read more about <a [routerLink]="['./', 'datasource-quickthrough']">Data source</a> and how to configure them.</p>

E> This page is still a WIP, the following is missing:

## TODO

- Welcome page

- Layout
  - Refactor the layout section documentation
  - Better explain the different layout, especially meta row types

- Datasource
  - Extend about datasource adapters?

- The Registry
  - What is the registry?
  - Registry for header / footer cells, table cells, and edit cells.
  - Single VS Mutli
  - Registry layers (DI)
  - DataHeaderExtensions

- Plugins
  - Plugin types: Directive / API / Dual
  - Running plugins without directives
  - Global plugin configuration
  - Plugin scope
    - Extends existing features (e.g. drag/drop)
    - New features all togethers (e.g. transpose)
  - Developers:
    - Extensibility model and API
    - Events

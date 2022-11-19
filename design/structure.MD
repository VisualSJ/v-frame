# Structure

## Base

```mermaid
classDiagram
    class VFrameBaseElement {
        + DataManager data
        + AttributeManager attribute
        - RenderManager renderer
    }

    class DataManager {
        Object~string, any~ data

        touch(String key) ~any~
        getProperty(String key) ~any~
        setProperty(String key, Any value) ~void~
        addListener(String key, Function handle) ~void~
        setSchema(SchemaJSON schema) ~void~
    }

    VFrameBaseElement *-- DataManager
```

```typescript
const $elem = document.querySelector('#example') as BaseVFrameElemen;
$elem.data.setProperty('src', 'http://itharbors.com');
```

## Life Cycle

```typescript
class VFrameInputElement extends {
    onInit(): void;
    onMounted(): void;
    onRemoved(): void;
}
```

## Data Update

```typescript
class VFrameInputElement extends {
    onInit() {
        this.data.addListener('src', (value) => {
            this.renderer.querySelector('.webview').src = value;
        });
    }
}
```
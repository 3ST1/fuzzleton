import {
  AdvancedDynamicTexture,
  Button,
  Container,
  Control,
  Rectangle,
  StackPanel,
  TextBlock,
  Checkbox,
  ScrollViewer,
  Image,
} from "@babylonjs/gui";

// Handles creation of UI components for the level creator
export class UIComponentsFactory {
  // Create a spacing element for UI
  static createSpacing(height: number): Rectangle {
    const spacing = new Rectangle("spacing");
    spacing.width = 1;
    spacing.height = `${height}px`;
    spacing.alpha = 0; // Make it invisible
    return spacing;
  }

  // Create basic button with standard styling
  static createButton(
    name: string,
    text: string,
    options: {
      width?: string;
      height?: string;
      color?: string;
      background?: string;
      fontSize?: number;
    } = {}
  ): Button {
    const btn = Button.CreateSimpleButton(name, text);
    btn.width = options.width || "150px";
    btn.height = options.height || "40px";
    btn.color = options.color || "white";
    btn.background = options.background || "orange";
    btn.cornerRadius = 5;
    if (options.fontSize) {
      btn.fontSize = options.fontSize;
    }
    return btn;
  }

  // Create a sidebar panel with standard styling
  static createSidebar(
    name: string,
    options: {
      width?: string;
      height?: string;
      alignment?: number;
      padding?: string;
    } = {}
  ): Rectangle {
    const sidebar = new Rectangle(name);
    sidebar.width = options.width || "250px";
    sidebar.height = options.height || "80%";
    sidebar.thickness = 2;
    sidebar.color = "white";
    sidebar.background = "rgba(50, 50, 50, 0.7)";
    sidebar.cornerRadius = 10;
    sidebar.horizontalAlignment =
      options.alignment || Control.HORIZONTAL_ALIGNMENT_RIGHT;
    sidebar.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;

    if (options.alignment === Control.HORIZONTAL_ALIGNMENT_RIGHT) {
      sidebar.paddingRight = options.padding || "20px";
    } else {
      sidebar.paddingLeft = options.padding || "20px";
    }

    return sidebar;
  }

  //Create a control panel for object manipulation
  static createControlPanel(name: string): Rectangle {
    const controlsPanel = new Rectangle(name);
    controlsPanel.width = "220px";
    controlsPanel.height = "550px";
    controlsPanel.thickness = 2;
    controlsPanel.color = "white";
    controlsPanel.background = "rgba(50, 50, 50, 0.8)";
    controlsPanel.cornerRadius = 10;
    controlsPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    controlsPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
    controlsPanel.top = "0px";
    controlsPanel.left = "20px";
    return controlsPanel;
  }

  // Create a scroll viewer for a container
  static createScrollViewer(name: string): ScrollViewer {
    const scrollViewer = new ScrollViewer(name);
    scrollViewer.width = "100%";
    scrollViewer.height = "95%";
    scrollViewer.barSize = 15;
    scrollViewer.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    return scrollViewer;
  }

  // Create an image preview for a model or shape
  static createImagePreview(
    name: string,
    imageUrl: string,
    options: {
      width?: string;
      height?: string;
      cornerRadius?: number;
      horizontalAlignment?: number;
      verticalAlignment?: number;
      top?: string;
      fallbackColor?: string;
    } = {}
  ): Control {
    const container = new Container(name + "-container");
    container.width = options.width || "40px";
    container.height = options.height || "40px";
    container.horizontalAlignment =
      options.horizontalAlignment || Control.HORIZONTAL_ALIGNMENT_CENTER;
    container.verticalAlignment =
      options.verticalAlignment || Control.VERTICAL_ALIGNMENT_BOTTOM;
    container.top = options.top || "-10px";

    const imageWrapper = new Rectangle(name + "-wrapper");
    imageWrapper.width = "100%";
    imageWrapper.height = "100%";
    imageWrapper.cornerRadius = options.cornerRadius || 5;
    imageWrapper.thickness = 0;

    const image = new Image(name, imageUrl);
    image.width = "100%";
    image.height = "100%";
    image.stretch = Image.STRETCH_UNIFORM;

    imageWrapper.addControl(image);
    container.addControl(imageWrapper);

    // Handle successful image load
    // image.onImageLoadedObservable.add(() => {
    //   console.log(`Image ${imageUrl} loaded successfully`);
    // });

    // Handle image loading error
    image.domImage.onerror = () => {
      console.warn(`Failed to load image ${imageUrl}, using fallback`);
      imageWrapper.removeControl(image);

      // Create fallback colored rectangle
      imageWrapper.background = options.fallbackColor || "gray";
    };

    return container;
  }
}

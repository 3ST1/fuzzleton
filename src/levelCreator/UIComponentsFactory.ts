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
  static BG_PANEL_COLOR = "rgba(50, 50, 50, 0.7)";
  static DEFAULT_CORNER_RADIUS: number = 5;
  static SIDEBAR_WIDTH: number = 300;

  // Create a spacing element for UI
  static createSpacing(height: number = 1, width: number = 1): Rectangle {
    const spacing = new Rectangle("spacing");
    spacing.width = `${width}px`;
    spacing.height = `${height}px`;
    spacing.alpha = 0; // invisible
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
      cornerRadius?: number;
      padding?: {
        top?: string;
        bottom?: string;
        left?: string;
        right?: string;
      };
    } = {}
  ): Button {
    const btn = Button.CreateSimpleButton(name, text);
    btn.width = options.width || "150px";
    btn.height = options.height || "40px";
    btn.color = options.color || "white";
    btn.background = options.background || "orange";
    btn.cornerRadius = options.cornerRadius || this.DEFAULT_CORNER_RADIUS;
    btn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    btn.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    if (options.padding) {
      if (options.padding.top) {
        btn.paddingTop = options.padding.top;
      }
      if (options.padding.bottom) {
        btn.paddingBottom = options.padding.bottom;
      }
      if (options.padding.left) {
        btn.paddingLeft = options.padding.left;
      }
      if (options.padding.right) {
        btn.paddingRight = options.padding.right;
      }
    }

    if (options.fontSize) {
      btn.fontSize = options.fontSize;
    }
    btn.hoverCursor = "pointer";
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
    sidebar.width = options.width || `${this.SIDEBAR_WIDTH}px`;
    sidebar.height = options.height || "75%";
    sidebar.thickness = 2;
    sidebar.color = "white";
    sidebar.background = this.BG_PANEL_COLOR;
    sidebar.cornerRadius = this.DEFAULT_CORNER_RADIUS;
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

  // Create a control panel for object manipulation
  static createControlPanel(
    name: string,
    options: {
      width?: string;
      height?: string;
      thickness?: number;
      color?: string;
      background?: string;
      cornerRadius?: number;
      horizontalAlignment?: number;
      verticalAlignment?: number;
      top?: string;
      left?: string;
    } = {}
  ): Rectangle {
    const controlsPanel = new Rectangle(name);
    controlsPanel.width = options.width || "20%";
    controlsPanel.height = options.height || "80%";
    controlsPanel.thickness =
      options.thickness !== undefined ? options.thickness : 2;
    controlsPanel.color = options.color || "white";
    controlsPanel.background = options.background || this.BG_PANEL_COLOR;
    controlsPanel.cornerRadius =
      options.cornerRadius || this.DEFAULT_CORNER_RADIUS;
    controlsPanel.horizontalAlignment =
      options.horizontalAlignment || Control.HORIZONTAL_ALIGNMENT_LEFT;
    controlsPanel.verticalAlignment =
      options.verticalAlignment || Control.VERTICAL_ALIGNMENT_BOTTOM;
    controlsPanel.top = options.top || "0px";
    controlsPanel.left = options.left || "20px";
    return controlsPanel;
  }

  // Create a scroll viewer for a container
  static createScrollViewer(
    name: string,
    options: {
      width?: string;
      height?: string;
      barSize?: number;
      thickness?: number;
      horizontalAlignment?: number;
      onScroll?: (scrollViewer: ScrollViewer) => void;
    } = {}
  ): ScrollViewer {
    const scrollViewer = new ScrollViewer(name);
    scrollViewer.width = options.width || "100%";
    scrollViewer.height = options.height || "95%";
    scrollViewer.thickness =
      options.thickness !== undefined ? options.thickness : 0;
    scrollViewer.barSize = options.barSize || 15;
    scrollViewer.horizontalAlignment =
      options.horizontalAlignment || Control.HORIZONTAL_ALIGNMENT_CENTER;

    // Add scroll event handler if provided
    if (options.onScroll) {
      // we use the vertical scrollbar's value change observable
      scrollViewer.verticalBar.onValueChangedObservable.add(() => {
        // console.log("Scroll position changed:", scrollViewer.verticalBar.value);
        options.onScroll!(scrollViewer);
      });
    }

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
      left?: string;
      fallbackColor?: string;
    } = {}
  ): Control {
    const container = new Container(name + "-container");
    container.width = options.width || "40px";
    container.height = options.height || "40px";
    container.horizontalAlignment =
      options.horizontalAlignment || Control.HORIZONTAL_ALIGNMENT_LEFT;
    container.verticalAlignment =
      options.verticalAlignment || Control.VERTICAL_ALIGNMENT_CENTER;
    container.top = options.top || "0px";
    container.left = options.left || "0px";

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

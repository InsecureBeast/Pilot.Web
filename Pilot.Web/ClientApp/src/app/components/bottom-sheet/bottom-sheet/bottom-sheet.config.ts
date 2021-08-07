
export interface IBottomSheetConfig {
    title?: string;
    backgroundColor?: string;
    isBackgroundEnabled?: boolean;
    fontColor?: string;
    enableCloseButton?: boolean;
    closeButtonTitle?: string;
    darkTheme?: boolean;
    isFullScreen: boolean;
    isMiddleScreen: boolean;
}

export class BottomSheetConfig implements IBottomSheetConfig {
    
    title?: string;
    backgroundColor?: string;
    isBackgroundEnabled?: boolean;
    fontColor?: string;
    enableCloseButton?: boolean;
    closeButtonTitle?: string;
    darkTheme?: boolean;
    isFullScreen: boolean;
    isMiddleScreen: boolean;
    
    public static newMiddleScreenConfig(): IBottomSheetConfig {
        const options = new BottomSheetConfig();
        options.isFullScreen = false;
        options.isMiddleScreen = true;
        return options;
    }

    public static newFullScreenConfig(): IBottomSheetConfig {
        const options = new BottomSheetConfig();
        options.isFullScreen = true;
        options.isMiddleScreen = false;
        return options;
    }
}
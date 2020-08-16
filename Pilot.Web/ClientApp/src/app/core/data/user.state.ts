import { IUserState, UserStateColors } from "./data.classes";
import { SafeUrl } from "@angular/platform-browser";
import { TypeIconService } from "../type-icon.service";
import { Injectable } from "@angular/core";

export class UserState {

    constructor(state: IUserState, private typeIconService: TypeIconService, userStateColorService: UserStateColorService) {
      this.id = state.id;
      this.name = state.name;
      this.title = state.title;
      this.color = userStateColorService.getColor(state.color);
      this.isDeleted = state.isDeleted;
      this.isCompletionState = state.isCompletionState;
      this.isSystemState = state.isSystemState;
  
      if (state.icon !== null)
        this.icon = this.typeIconService.getSvgIcon(state.icon);
    }
  
    id: string;
    name: string;
    title: string;
    icon: SafeUrl;
    color: string;
    isDeleted: boolean;
    isCompletionState: boolean;
    isSystemState: boolean;
  }

  @Injectable({ providedIn: 'root' })
  export class UserStateColorService {
    
    private colors = new Map<UserStateColors, string>();

    constructor() {
      this.colors.set(UserStateColors.None, "#ffffff");
      this.colors.set(UserStateColors.Color1, "#BABABA");
      this.colors.set(UserStateColors.Color2, "#B7E281");
      this.colors.set(UserStateColors.Color3, "#92E1D5");
      this.colors.set(UserStateColors.Color4, "#A6E0FC");
      this.colors.set(UserStateColors.Color5, "#FFC8EA");
      this.colors.set(UserStateColors.Color6, "#FE9F79");
      this.colors.set(UserStateColors.Color7, "#E0C378");
    }

    getColor(userStateColor : UserStateColors): string {
      return this.colors.get(userStateColor);
    }
  }
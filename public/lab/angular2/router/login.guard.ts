import {CanActivate} from "@angular/router";
/**
 * Created by Kaitai on 2017/4/16.
 * 登入守卫
 */
export class LoginGuard implements CanActivate {
  canActivate() {
    let loggedIn: boolean = Math.random() < 0.5;
    if (!loggedIn) {
      console.log("用户未登录");
    }
    return loggedIn;
  }
}

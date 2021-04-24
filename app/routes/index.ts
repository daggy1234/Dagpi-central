import { Router } from "express";
import { AppRouter } from "./app/index";
import { UserRouter } from "./user";
import { CliRouter } from "./cli";
import { AppRoute } from "./app-route";
import { TokenRouter } from "./tokens";
import { SelfRouter } from "./self";

export class AppRouting {
  constructor(private route: Router) {
    this.route = route;
    this.addAll();
  }

  addAll() {
    this.addRouter(new AppRouter());
    this.addRouter(new UserRouter());
    this.addRouter(new CliRouter());
    this.addRouter(new TokenRouter());
    this.addRouter(new SelfRouter());
  }

  addRouter(config: AppRoute) {
    this.route.use(config.route, config.router);
  }
}

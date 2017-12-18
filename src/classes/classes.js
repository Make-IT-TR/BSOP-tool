"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Event {
}
exports.Event = Event;
class All {
}
exports.All = All;
class User {
}
exports.User = User;
class Project {
    constructor() {
        this.platforms = [];
    }
}
exports.Project = Project;
class Category {
}
exports.Category = Category;
class Platform {
}
exports.Platform = Platform;
class ProjectPlatform {
}
exports.ProjectPlatform = ProjectPlatform;
class ApiResult {
}
exports.ApiResult = ApiResult;
class Log {
}
exports.Log = Log;
function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}
exports.guid = guid;
//# sourceMappingURL=C:/arnoud/Projects/apps/make-it/BSOP-tool/dist/server/src/classes/classes.js.map
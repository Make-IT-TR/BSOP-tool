export class Event {
    title: string;
    image: string;
    _projects: Project[];
    likes: { [id: number]: number };
}

export class All {
    categories: Category[];
    platforms: Platform[];
    projects: Project[];
    events: Event[];
}

export class User {
    name: string;
    email: string;
}

export class Project {
    id: number;
    event: string;
    title: string;
    subtitle: string;
    description: string;
    image: string;
    keywords: string;
    shareUrl: string;
    platforms?: ProjectPlatform[];
    email: string;


    _likes?: number;


    constructor() {
        this.platforms = [];
    }
}

export class Category {
    id: number;
    title: string;
    image: string;
    color?: string;
    _platforms?: ProjectPlatform[];
    _more?: boolean;
    _hide?: boolean;
    _opacity?: number;
}

export class Platform {
    id: number;
    title: string;
    key: string;
    image?: string;
    description?: string;
    url?: string;
    categories: number[];

}

export class ProjectPlatform {
    id: number;
    platform?: number;
    url?: string;
    category?: number;
    _platform?: Platform;
}

export class ApiResult {
    project?: Project;
    categories?: Category[];
    event?: Event;
}

export class Log {
    timestamp: Date;
    user: string;
    ip: string;
    category: string;
    target: string;
    details: string;
}

export function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}

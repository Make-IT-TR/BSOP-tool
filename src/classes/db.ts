import * as loki from 'lokijs';
import { Project, Platform, Category, ProjectPlatform } from './classes';

// tslint:disable-next-line:class-name
export class data {



  public projects: loki.Collection<Project> = null; // new LokiCollection();
  public categories: loki.Collection<Category> = null;
  public platforms: loki.Collection<Platform> = null;


  // init lokijs
  public db = new loki('demo.json', {
    //  adapter: idbAdapter,
    autoload: true,
    autoloadCallback: this.initDatabase,
    autosave: true,
    autosaveInterval: 1000
  });

  initDatabase() {

    console.log('load handler');
    // if database did not exist it will be empty so I will intitialize here
    this.initProjects();
    this.initCategories();
    this.initPlatforms();
  }

  addPlatform(platform: Platform) {
    const p = this.platforms.findOne({ id: platform.id });
    if (!p) {
      this.platforms.insert(platform);
    } else {
      for (const item in platform) {
        if (item !== 'id') {
          p[item] = platform[item];
        }
      }
      this.platforms.update(p);
    }
  }
  initPlatforms() {
    console.log('Init platforms');
    this.platforms = this.db.getCollection<Platform>('platforms');
    if (this.platforms === null) { this.platforms = this.db.addCollection<Platform>('platforms'); }
    this.addPlatform(<Platform>{ id: 1, title: 'email', image: 'email.png', categories: [1, 5] });
    this.addPlatform(<Platform>{ id: 2, title: 'twitter', image: 'twitter.png', categories: [2] });
    this.addPlatform(<Platform>{ id: 3, title: 'facebook', image: 'facebook.png', categories: [2] });
    this.addPlatform(<Platform>{ id: 4, title: 'youtube', image: 'youtube.png', categories: [2] });
  }

  addCategory(category: Category) {
    const c = this.categories.findOne({ id: category.id });
    if (!c) {
      this.categories.insert(category);
    } else {
      for (const item in category) {
        if (item !== 'id') {
          c[item] = category[item];
        }
      }
      this.categories.update(c);
    }
  }

  initCategories() {
    // init categories
    console.log('Init categories');
    this.categories = this.db.getCollection<Category>('categories');
    if (this.categories === null) { this.categories = this.db.addCollection<Category>('categories'); }
    this.addCategory({ id: 1, title: 'Contact', image: 'contact.png' });
    this.addCategory({ id: 2, title: 'Follow', image: 'follow.png' });
    this.addCategory({ id: 3, title: 'Fund', image: 'fund.png' });
    this.addCategory({ id: 4, title: 'Contribute', image: 'contribute.png' });
    this.addCategory({ id: 5, title: 'Feedback', image: 'feedback.png' });
  }

  addProject(project: Project) {
    const p = this.projects.findOne({ id: project.id });
    if (!p) {
      this.projects.insert(project);
    } else {
      for (const item in project) {
        if (item !== 'id') {
          p[item] = project[item];
        }
      }
      this.projects.update(p);
    }
  }

  public initProjects = () => {
    // init projects
    console.log('Init projects');
    this.projects = this.db.getCollection<Project>('projects');
    if (this.projects === null) { this.projects = this.db.addCollection<Project>('projects'); }

    const project = new Project();
    project.id = 1;
    project.title = 'Bits of Time';
    project.subtitle = 'Die digitale Sanduhr';
    project.description = '';
    project.platforms = [];
    // tslint:disable-next-line:max-line-length
    project.description = 'Ein klassisches Konzept in modernem Gewand. Schon die Anordnung der beiden PixBlock-Module verrät, dass es sich hier um keine gewöhnliche Anwendung einer LED-Matrix-Anzeige handelt. Wie beim klassischen Vorbild wird die Uhr durch Umdrehen gestartet. Eine schicke Sandkornsimulation, irgendwo zwischen physikalischem Naturalismus und pixeliger Avantgarde, visualisiert das Verstreichen der Zeit.';
    project.platforms.push(<ProjectPlatform>{ id: 1, platform: 1, url: 'mailto:arnoud.dejong@tno.nl' });
    project.platforms.push(<ProjectPlatform>{ id: 2, platform: 2, url: 'https://twitter.com/analyticbridge' });
    project.platforms.push(<ProjectPlatform>{ id: 3, platform: 4, url: 'https://www.youtube.com/watch?v=KilkHpM_-b0' });
    this.addProject(project);


  }
}

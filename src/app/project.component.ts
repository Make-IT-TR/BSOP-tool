import { Component } from '@angular/core';

import * as classes from './../classes/classes.js';
import * as _ from 'lodash';
import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
// tslint:disable-next-line:import-blacklist
import 'rxjs/Rx';
import { CookieService } from 'angular2-cookie/core';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.css']
})


@Injectable()
export class ProjectComponent {

  public project: classes.Project;

  public projects: classes.Project[];
  public event: classes.Event;
  public stats: classes.Event;


  public view = 'project';
  public categories: classes.Category[];
  public id: string;

  public liked: boolean;

  public likes: number[];
  public email: string;
  public selectedCategory: classes.Category;
  public emailSet: boolean;

  // tslint:disable-next-line:max-line-length
  colors = ['#377eb8', '#4daf4a', '#984ea3', '#e41a1c', '#a65628', '#f781bf', '#999999', '#1f78b4', '#b2df8a', '#33a02c', '#fb9a99']; // ['#1f78b4', '#b2df8a', '#33a02c', '#fb9a99', '#e31a1c', '#fdbf6f', '#ff7f00', '#cab2d6', '#a6cee3']

  public validateEmail(email) {
    // tslint:disable-next-line:max-line-length
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

  public save() {
    if (this.validateEmail(this.email)) {
      this._cookieService.put('email', this.email);
      this.emailSet = true;
      this.http.get('/api/emailRegistration/' + this.project.id)
        .map(res => res.text())
        .subscribe(
        data => {
        });
    } else {
      alert('email adres is not valid, please try again');
    }

  }

  private getLikes() {
    this.likes = <number[]>this._cookieService.getObject('likes');
    if (!this.likes) { this.likes = []; }
    this.liked = this.likes.indexOf(this.project.id) >= 0;
    // [];
    // if (ll) {
    //   ll.split(',').forEach(l => {
    //     let nr = parseInt(l);
    //     this.likes.push(nr);
    //   })
    // }
  }

  constructor(private http: Http, private _cookieService: CookieService) {
    this.id = _cookieService.get('uid'); // => 'value'
    const view = window.location.pathname.split('/')[1].toLowerCase();
    switch (view) {
      case 'project':
        this.getProject();
        break;
      case 'leaflet':
      case 'floorplan':
      case 'event':
        this.getEvent();
        break;
      case 'stats':
        this.getStats();
        break;
    }
    // if (!this.id) {
    //   let expiresAt = new Date();
    //   expiresAt.setDate(new Date().getDate() + 12 * 30 * 12);
    //   _cookieService.put('uid', this.guid(), { expires: expiresAt });
    // }

    this.emailSet = this._cookieService.getAll().hasOwnProperty('email');


  }

  likeProject() {
    if (this.likes.indexOf(this.project.id) === -1) {
      this.likes.push(this.project.id);
      this.liked = true;
      this._cookieService.putObject('likes', this.likes);
      this.http.get('/api/log/like/' + this.project.id + '/like')
        .map(res => res.text())
        .subscribe(
        data => {
        });
        // alert('liked');
    } else {
      // alert('already liked');
    }


  }



  categorySelect(c: classes.Category) {

    this.categories.forEach(cat => { cat._more = false; cat._opacity = 1; });
    this.http.get('/api/log/categorySelect/' + this.project.id + '/' + c.id)
      .map(res => res.text())
      .subscribe(
      data => {
      });
    if (c._platforms.length === 1) {
      window.location.href = '/follow/' + this.project.id + '/' + c._platforms[0].id;
    } else {
      this.selectedCategory = c;
      this.categories.forEach(cat => cat._opacity = (cat !== c) ? 0.15 : 1);
      c._more = true;
    }

  }

  getProject() {
    const projectId = _.last(window.location.pathname.split('/'));

    this.http.get('/api/projects/' + projectId)
      .map(res => res.text())
      .subscribe(
      data => {
        console.log('Project Received');
        const result = <classes.ApiResult>JSON.parse(data);
        this.project = result.project;
        this.categories = result.categories;
        for (let i = 0; i < this.categories.length; i++) {
          this.categories[i].color = this.colors[i];
        }
        this.project.platforms.forEach(p => {
          const category = _.find(this.categories, { 'id': p.category });
          if (category) {
            if (!category._platforms) { category._platforms = []; }
            category._platforms.push(p);
          }
        });
        this.project.shareUrl = 'http://cool3.sensorlab.tno.nl:8003/share/' + this.project.id;
        this.getLikes();
      },
      err => console.log(err),
      () => { }
      );

  }

  getEvent() {
    const eventId = _.last(window.location.pathname.split('/'));

    this.http.get('/api/events/' + eventId)
      .map(res => res.text())
      .subscribe(
      data => {
        console.log('Event Received');
        const result = <classes.ApiResult>JSON.parse(data);
        this.event = result.event;
        this.projects = _.orderBy(this.event._projects, 'title');
      },
      err => console.log(err),
      () => { }
      );
  }

  getStats() {
    const eventId = _.last(window.location.pathname.split('/'));

    this.http.get('/api/events/' + eventId)
      .map(res => res.text())
      .subscribe(
      data => {
        console.log('Stats Received');
        const result = <classes.ApiResult>JSON.parse(data);
        this.stats = result.event;
        this.stats._projects.forEach(p => {
          (<any>p)._likes = result.event.likes[p.id];
        });
        this.projects = _.orderBy(this.stats._projects, '_likes', 'desc');
      },
      err => console.log(err),
      () => { }
      );
  }

  public share() {

  }

  private guid() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4();
  }
}

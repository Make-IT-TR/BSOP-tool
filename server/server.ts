import * as express from 'express';
import * as path from 'path';
import fs = require('fs');
import _ = require('underscore');
import loki = require('lokijs');
import useragent = require('useragent');
import cookieParser = require('cookie-parser');
import Papa = require('papaparse');

useragent(true);

import classes = require('./../src/classes/classes');


const projects: loki.LokiCollection<classes.Project> = null; // new LokiCollection();
const categories: loki.LokiCollection<classes.Project> = null;
const platforms: loki.LokiCollection<classes.Platform> = null;

const likes: string[] = [];



let db = <classes.All>{};

function validateEmail(email) {
  let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

function validateUrl(url) {
  var re = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
  return re.test(url);
}

function parsePlatforms(text: string, category: number, project: classes.Project) {
  if (!text) return;
  var list = text.split(/[\s,]+/);
  list.forEach(l => {
    if (l != '') {

      // check for email
      if (validateEmail(l)) {
        let pp = new classes.ProjectPlatform();
        pp.category = category;
        pp.url = "mailto:" + l;
        pp.platform = 4;
        project.platforms.push(pp);
      }
      else {

        l = (l.indexOf('://') == -1) ? 'http://' + l : l;
        if (validateUrl(l)) {
          var found = false;
          db.platforms.forEach(platform => {
            if ((l.toLowerCase().indexOf(platform.title.toLowerCase()) > -1) || (platform.key && l.toLowerCase().indexOf(platform.key.toLowerCase()) > -1)) {
              found = true;
              let pp = new classes.ProjectPlatform();
              pp.category = category;
              pp.url = l;
              pp.platform = platform.id;
              project.platforms.push(pp);
            }

          });
          if (!found) {
            let pp = new classes.ProjectPlatform();
            pp.category = category;
            pp.url = l;
            pp.platform = 5;
            project.platforms.push(pp);
            console.log("link:" + l);
          }

        }
        else {
          console.log("error:" + l);
        }
      }

    }
  });

  //console.log(JSON.stringify(list));
}

function loadEvent(name: string, nr: number, email, title) {

  let event = _.findWhere(db.events, { title: name });
  let eventData = fs.readFileSync('events/' + name + '/sheet.csv').toString();

  // Parse local CSV file
  Papa.parse(eventData, {
    delimiter: ',',
    header: false,
    complete: (results) => {
      let first = true;
      results.data.forEach(d => {
        let p = new classes.Project();
        p.id = nr;
        p.email = d[email];
        p.title = d[title];
        p.event = name;
        p.description = d[35];
        if (p.title === 'xDroid') {
          console.log('xdroid');
        }

        let learnmore = d[13];
        parsePlatforms(d[13], 1, p);
        parsePlatforms(d[14], 2, p);
        parsePlatforms(d[15], 3, p);
        parsePlatforms(d[16], 4, p);
        parsePlatforms(d[17], 5, p);
        parsePlatforms(d[18], 6, p);
        parsePlatforms(d[19], 7, p);
        parsePlatforms(d[20], 8, p);
        parsePlatforms(d[21], 9, p);

        if (p.platforms.length === 0) {
          let pp = new classes.ProjectPlatform();
          pp.category = 9;
          pp.url = 'mailto:' + p.email;
          pp.platform = 4;
          p.platforms.push(pp);
        }

        let pid = 1;
        p.platforms.forEach(pp => {
          pp.id = pid;
          pid += 1;
        });


        if (!first) {
          db.projects.push(p);
          //console.log(nr + " : " + p.email + " : http://makeit.fyi/poster/" + p.id);
          nr += 1;
        }
        first = false;

      })
      // console.log("Finished:", results.data);
    }
  });

  const likeFile = 'events/' + name + '/likes.json';

  if (event && fs.existsSync(likeFile)) {
    const likeData = JSON.parse(fs.readFileSync(likeFile).toString()) as { [p: number]: number };
    if (likeData) {
      event.likes = likeData;
    }
  }
}

function loadData() {


  db = <classes.All>JSON.parse(fs.readFileSync('projects.json').toString());

    loadEvent('demo', 100, 1, 2);

  db.events.forEach(e => {
    e._projects = [];
    if (!e.likes) e.likes = {};

    db.projects.forEach(p => {
      if (p.event === e.title) {
        e._projects.push(p);
        if (!e.likes.hasOwnProperty(p.id)) e.likes[p.id] = 0;
      }
    });

  })
}

function addPlatform(platform: classes.Platform) {
  let p = platforms.findOne({ id: platform.id });
  if (!p) {
    platforms.insert(platform);
  } else {
    for (const item in platform) {
      if (item !== 'id' && !item.startsWith('_')) {
        p[item] = platform[item];
      }
    }
    platforms.update(p);
  }
}


function addCategory(category: classes.Category) {
  let c = categories.findOne({ id: category.id });
  if (!c) {
    categories.insert(category);
  } else {
    for (const item in category) {
      if (item !== 'id' && !item.startsWith('_')) {
        c[item] = category[item];
      }
    }
    categories.update(c);
  }
}


function addProject(project: classes.Project) {
  let p = projects.findOne({ id: project.id });
  if (!p) {
    projects.insert(project);
  } else {
    for (const item in project) {
      if (item !== 'id' && !item.startsWith('_')) {
        p[item] = project[item];
      }
    }
    projects.update(p);
  }
}

process.stdin.resume(); // so the program will not close instantly

const app: express.Application = express();

Log('all', 'Start server', '', '', null);

// the relative path from src/server/server.js
//const staticRoot = path.resolve(__dirname, './../dist/');

const staticRoot = path.resolve(__dirname, './../dist/');
app.use(express.static(staticRoot));
app.use(cookieParser());

app.disable('x-powered-by');
// in production mode run application from dist folder
app.use('/node_modules', express.static(path.join(__dirname, '/../node_modules')));
app.use('/', express.static(path.join(__dirname, '/../dist')));
app.get('/qrp/:projectId', (req, res) => {

  Log(getEvent(req.params.projectId), 'QR poster', req.params.projectId, '', req);
  res.redirect('/project/' + req.params.projectId);
});

app.get('/qr/:projectId', (req, res) => {
  Log(getEvent(req.params.projectId), 'QR leaflet', req.params.projectId, '', req);
  res.redirect('/project/' + req.params.projectId);
});

app.get('/p/:projectId', (req, res) => {
  Log(getEvent(req.params.projectId), 'Link', req.params.projectId, '', req);
  res.redirect('/project/' + req.params.projectId);
});

app.get('/nfc/:projectId', (req, res) => {
  Log(getEvent(req.params.projectId), 'NFC', req.params.projectId, '', req);
  res.redirect('/project/' + req.params.projectId);
});

app.get('/l/:projectId', (req, res) => {
  Log(getEvent(req.params.projectId), 'Link leaflet', req.params.projectId, '', req);
  res.redirect('/project/' + req.params.projectId);
});

app.get('/share/:projectId', (req, res) => {
  Log(getEvent(req.params.projectId), 'Share', req.params.projectId, '', req);
  res.redirect('/project/' + req.params.projectId);
});

app.get('/follow/:projectId/:platformId', (req, res) => {
  Log(getEvent(req.params.projectId), 'Follow', req.params.projectId, req.params.platformId, req);
  console.log('follow ' + req.params.projectId + ' - ' + req.params.platformId);
  const r = _.findWhere(db.projects, { id: parseInt(req.params.projectId) }); // projects.findOne({ id: parseInt(req.params.projectId) });

  if (r) {

    let platform = _.findWhere(r.platforms, { id: parseInt(req.params.platformId) });
    if (platform) {
      res.redirect(platform.url);
    }
  }

  //  res.end(req.params.projectId + ' - ' + req.params.platformId);
});

app.get('/api/emailRegistration/:projectId', (req, res) => {
  Log(getEvent(req.params.projectId), 'email registration', '', '', req);
  const email = (req.cookies && req.cookies['email']) ? req.cookies['email'] : '';
  let send = require('gmail-send')({
    user: 'damylen@gmail.com',               // Your GMail account used to send emails
    pass: 'hiigkubtejmldjay',             // Application-specific password
    to: '"User" <damylen@gmail.com>',      // Send back to yourself
    subject: 'bsop email registration',
    text: email + ' - ' + req.params.projectId
  });

  send({
  }, (err, r) => {
    console.log('* [example1] send(): err:', err, '; res:', r);
  });

});

app.get('/api/log/:action/:param1/:param2', (req, res) => {
  Log(getEvent(req.params.param1), req.params.action, req.params.param1, req.params.param2, req);
  if (req.params.action === 'like') {
    const uid = (req.cookies && req.cookies['uid']) ? req.cookies['uid'] : '';
    const project = req.params.param1;
    const e = getEvent(project);
    var ls = project + ":" + uid;
    if (likes.indexOf(ls) === -1) {
      var event = <classes.Event>_.findWhere(db.events, { title: e });
      if (event) {
        event.likes[project] += 1;
      }
      likes.push(ls);
      console.log('got a like for ' + project + ' (' + e + ') from ' + uid);
      let likeFile = 'events/' + e + '/likes.json';
      fs.writeFile(likeFile, JSON.stringify(event.likes), (error) => {
        if (error) console.log(JSON.stringify(error));
        console.log("Done writing");
      });
    }

  }
  res.end('ok');
});

app.get('/api/projects/:projectId', (req, res) => {
  Log(getEvent(req.params.projectId), 'api.project', req.params.projectId, '', req);
  const project = _.findWhere(db.projects, { id: parseInt(req.params.projectId) }); // projects.findOne({ id: parseInt(req.params.projectId) });
  project.platforms.forEach((p: classes.ProjectPlatform) => {
    p._platform = _.findWhere(db.platforms, { id: p.platform }); // platforms.findOne({ id: p.platform });
  });

  if (project) {
    res.end(JSON.stringify(<classes.ApiResult>{ project: project, categories: db.categories }));
  } else {
    res.end(JSON.stringify(new classes.Project()));
  }

});

app.get('/api/events/:eventId', (req, res) => {
  Log(req.params.eventId, 'api.event', req.params.eventId, '', req);
  const event = _.findWhere(db.events, { title: req.params.eventId }); // projects.findOne({ id: parseInt(req.params.projectId) });
  // project.platforms.forEach((p: classes.ProjectPlatform) => {
  //   p._platform = _.findWhere(db.platforms, { id: p.platform }); //platforms.findOne({ id: p.platform });
  // });

  if (event) {
    res.end(JSON.stringify(<classes.ApiResult>{ event: event }));
  } else {
    res.end(JSON.stringify(new classes.Event()));
  }

});



app.get('/api/projects', (req, res) => {
  res.end(JSON.stringify(db.projects));
});

app.get('/project/:projectId', (req, res) => {

  if (!req.cookies || !req.cookies['uid']) {
    const uid = classes.guid();
    res.cookie('uid', uid, { maxAge: 900000000, httpOnly: false });
    req.cookies['uid'] = uid;
  }
  // const uid = (req.cookies && req.cookies['uid']) ? req.cookies['uid'] : '';

  Log(getEvent(req.params.projectId), 'Project', req.params.projectId, '', req);
  res.sendFile('index.html', { root: staticRoot });
});

app.get('/event/:eventId', (req, res) => {

  if (!req.cookies || !req.cookies['uid']) {
    const uid = classes.guid();
    res.cookie('uid', uid, { maxAge: 900000000, httpOnly: false });
    req.cookies['uid'] = uid;
  }
  // const uid = (req.cookies && req.cookies['uid']) ? req.cookies['uid'] : '';

  Log(req.params.eventId, 'Event', req.params.eventId, '', req);
  res.sendFile('index.html', { root: staticRoot });
});

app.get('/leaflet/:eventId', (req, res) => {

  if (!req.cookies || !req.cookies['uid']) {
    const uid = classes.guid();
    res.cookie('uid', uid, { maxAge: 900000000, httpOnly: false });
    req.cookies['uid'] = uid;
  }
  // const uid = (req.cookies && req.cookies['uid']) ? req.cookies['uid'] : '';

  Log(req.params.eventId, 'Leaflet', req.params.eventId, '', req);
  res.sendFile('index.html', { root: staticRoot });
});

app.get('/floorplan/:eventId', (req, res) => {

  if (!req.cookies || !req.cookies['uid']) {
    const uid = classes.guid();
    res.cookie('uid', uid, { maxAge: 900000000, httpOnly: false });
    req.cookies['uid'] = uid;
  }
  // const uid = (req.cookies && req.cookies['uid']) ? req.cookies['uid'] : '';

  Log(req.params.eventId, 'Floorplan', req.params.eventId, '', req);
  res.sendFile('index.html', { root: staticRoot });
});

app.get('/stats/:eventId', (req, res) => {

  if (!req.cookies || !req.cookies['uid']) {
    const uid = classes.guid();
    res.cookie('uid', uid, { maxAge: 900000000, httpOnly: false });
    req.cookies['uid'] = uid;
  }
  Log(req.params.eventId, 'Stats', req.params.eventId, '', req);
  res.sendFile('index.html', { root: staticRoot });
});

app.get('/flyer', (req, res) => {

  Log(getEvent(req.params.projectId), 'Flyer', req.params.projectId, '', req);
  res.sendFile('flyer.html', { root: staticRoot });

});


app.get('/poster/:projectId', (req, res) => {
  Log(getEvent(req.params.projectId), 'Poster', req.params.projectId, '', req);
  fs.readFile(path.join(__dirname + './../src/poster.html'), 'utf-8', (err, content) => {
    if (err) {
      res.end('error occurred' + JSON.stringify(err));
      return;
    }
    let t = _.template(content);
    let r = _.findWhere(db.projects, { id: parseInt(req.params.projectId) });
    if (r) {
      res.end(t({ url: '<script >var url = "http://makeit.fyi/qrp/' + req.params.projectId + '";var projectname = "' + r.title + '"; var link = "http://makeit.fyi/p/' + req.params.projectId + '"</script>' }));
    }
    else {
      res.end("Not found");
    }

  });
});


function esc_quot(text) {
  return text.replace("'", "");
}


app.get('/flyer', (req, res) => {
  // Log('Flyer', '', '', req);
  // fs.readFile(path.join(__dirname + './../src/flyer.html'), 'utf-8', (err, content) => {
  //   if (err) {
  //     res.end('error occurred' + JSON.stringify(err));
  //     return;
  //   }
  //   let t = _.template(content);
  //   //let r = _.findWhere(db.projects, { id: parseInt(req.params.projectId) });
  //   res.end(t({ projects: '<script>var project = "+ db.projects + "</script>' }));

  // });
});

function getEvent(projectId) {
  let r = _.findWhere(db.projects, { id: parseInt(projectId) }) as classes.Project;
  if (r) return r.event;
  return "all";

}

app.get('/cards/:projectId', (req, res) => {
  Log(getEvent(req.params.projectId), 'Cards', req.params.projectId, '', req);
  fs.readFile(path.join(__dirname + './../src/cards.html'), 'utf-8', (err, content) => {
    if (err) {
      res.end('error occurred' + JSON.stringify(err));
      return;
    }
    let t = _.template(content);
    let r = _.findWhere(db.projects, { id: parseInt(req.params.projectId) });
    let pr = {};
    db.projects.forEach(p => {
      pr[p.id] = p.title;
    });
    res.end(t({ url: '<script>var projects = ' + JSON.stringify(pr) + '</script>' }));

  });
});


const port = 8003;
loadData();
app.listen(port, () => {
  console.log('Example app listening on port ' + port);
});

export function Log(event: string, category: string, details: string, details2, req: express.Request) {
  const div = '|';
  let ll = new Date().getTime() + div + category + div + details + div + details2;
  if (req) {
    const uid = (req.cookies && req.cookies['uid']) ? req.cookies['uid'] : '';
    const email = (req.cookies && req.cookies['email']) ? req.cookies['email'] : '';
    const agent = useragent.parse(req.headers['user-agent']);
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    ll += div + agent.family + div + agent.os + div + agent.device + div + req.originalUrl + div + ip + div + uid + div + email;
  } else {

  }
  ll += '\n';
  fs.appendFile('logs/' + event + '.csv', ll, (err) => {
    if (err) {
      console.log('Error appending: ' + ll);
    } else {
      console.log(ll);
    }
    // console.log('The "data to append" was appended to file!');
  });
  // console.log(req);
}

function exitHandler(options, err) {

  if (options.cleanup) console.log('clean');
  if (err) console.log(err.stack);
  if (options.exit) process.exit();
}

// do something when app is closing
process.on('exit', exitHandler.bind(null, { cleanup: true }));

// catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, { exit: true }));

// catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, { exit: true }));

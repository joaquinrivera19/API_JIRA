const express = require('express')
const app = express()
const axios = require('axios');
const bodyParser = require('body-parser');

//app.use(express.static(__dirname + '/public'));

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))

app.set('view engine', 'hbs');

// parse requests of content-type - application/json
app.use(bodyParser.json())

//const board = 154;
//const sprint = 577;

//Get all boards
//https://santex.atlassian.net/rest/agile/1.0/board

//Get board
//https://santex.atlassian.net/rest/agile/1.0/board/{boardId}

//Get projects
//https://santex.atlassian.net/rest/agile/1.0/board/{boardId}/project

//Get all sprints
//https://santex.atlassian.net/rest/agile/1.0/board/{boardId}/sprint

//Get issues for sprint
//https://santex.atlassian.net/rest/agile/1.0/board/{boardId}/sprint/{sprintId}/issue

//Get sprint
//https://santex.atlassian.net/rest/agile/1.0/sprint/{sprintId}

//Get issues for sprint -- Me trae tareas que no se de donde son.
//https://santex.atlassian.net/rest/agile/1.0/sprint/{sprintId}/issue

app.get('/', (req, res) => {

    let list_board = [];

    axios.get('https://santex.atlassian.net/rest/agile/1.0/board', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic anJpdmVyYUBhZ2QuY29tLmFyOnU0NGQ0ZFhPNDRzeFJjSXNaeVNvQTE5OQ=='
            }
        })
        .then(response => {

            const results_board = response.data.values;

            for (var indice in results_board) {
                if (results_board.hasOwnProperty(indice)) {
                    list_board.push(results_board[indice]);
                }
            }

            //res.json(list_board)
            res.render('list_board', { list_board });

        })
        .catch(error => {
            console.log(error);
        });

});

app.get('/:board', (req, res) => {

    var board = req.params.board || undefined;
    let list_sprint = [];

    axios.get('https://santex.atlassian.net/rest/agile/1.0/board/' + board + '/sprint', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic anJpdmVyYUBhZ2QuY29tLmFyOnU0NGQ0ZFhPNDRzeFJjSXNaeVNvQTE5OQ=='
            }
        })
        .then(response => {

            const results_sprint = response.data.values;

            for (var indice in results_sprint) {
                if (results_sprint.hasOwnProperty(indice)) {
                    list_sprint.push(results_sprint[indice])
                }
            }

            //res.json(list_sprint)
            res.render('list_sprint', { list_sprint });

        })
        .catch(error => {
            console.log(error);
        });

});

app.get('/:board/:sprint', (req, res) => {

    var board = req.params.board || undefined;
    var sprint = req.params.sprint || undefined;

    if (board != undefined && sprint != undefined) {

        var initializePromise = ListSprint(board, sprint);

        initializePromise.then(function(result) {

            //res.json(result)

            var list_task = result.ar;
            var startAt = result.startAt;
            var maxResults = result.maxResults;
            var total = result.total;

            res.render('list_task', { list_task, startAt, maxResults, total });

        }, function(err) {
            console.log('error dentro:' + err);
        })

    } else {
        res.json('No definido board, ni sprint');
    }

})

function ListSprint(board, sprint) {

    let ar = [];

    return new Promise(function(resolve, reject) {

        axios.get('https://santex.atlassian.net/rest/agile/1.0/board/' + board + '/sprint/' + sprint + '/issue', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Basic anJpdmVyYUBhZ2QuY29tLmFyOnU0NGQ0ZFhPNDRzeFJjSXNaeVNvQTE5OQ=='
                }
            })
            .then(response => {

                //console.log(response.data.issues[5]);
                //console.log(response.data.issues[5].key); //key: 'PDUC-1010'
                //console.log(response.data.issues[5].fields.issuetype.name); //name: 'Historia',
                //console.log(response.data.issues[5].fields.sprint.id); //name: '577',
                //console.log(response.data.issues[5].fields.sprint.originBoardId); //name: '154',
                //console.log(response.data.issues[5].fields.sprint.name); //name: 'PDUC Sprint 31',
                //console.log(response.data.issues[5].fields.sprint.state); //state: 'active',
                //console.log(response.data.issues[5].fields.project.key); //key: 'PDUC',
                //console.log(response.data.issues[5].fields.project.name); // name: 'AGD - UNCO Clientes',
                //console.log(response.data.issues[5].fields.priority.name); // name: 'Normal',
                //console.log(response.data.issues[5].fields.status.name); // name: 'En curso'',
                //console.log(response.data.issues[5].fields.description); // description: '.....',
                //console.log(response.data.issues[5].fields.summary); // summary: '[MB] Mostrar ultima actualización',
                //console.log('https://santex.atlassian.net/browse/' + response.data.issues[5].key); // https://santex.atlassian.net/browse/PDUC-1010

                //"startAt": 0,
                //"maxResults": 50,
                //"total": 37,

                const results = response.data.issues;

                const startAt = response.data.startAt;
                const maxResults = response.data.maxResults;
                const total = response.data.total;

                for (var indice in results) {
                    if (results.hasOwnProperty(indice)) {

                        ar.push({
                            key: results[indice].key,
                            summary: results[indice].fields.summary,
                            issuetype: results[indice].fields.issuetype.name,
                            priority: results[indice].fields.priority.name,
                            status: results[indice].fields.status.name
                        })

                    }
                }

                resolve({ ar, startAt, maxResults, total });

            })
            .catch(error => {
                reject(error);
            });

    });





}

app.listen(3000, () => console.log('Example app listening on port 3000!'))
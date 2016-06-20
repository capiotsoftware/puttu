var zookeeper = require("node-zookeeper-client"),
    os = require("os");

var client = zookeeper.createClient("localhost:2181");
var option = process.argv[2];
var path = process.argv[3];
var data = process.argv[4];

function create(_client){
    _client.create(path, function (error) {
        if (error) {
            console.log('Failed to create node: %s due to: %s.', path, error);
        } else {
            console.log('Node: %s is successfully created.', path);
        }
    });
}

function remove(_client){
    _client.remove(path, -1, (error) => {
        if (error) {
            console.log(error.stack);
            return;
        }
        console.log('Node is deleted.');
    });
}

function listChildren(client) {
    client.getChildren(
        path,
        function (event) {
            console.log('Got watcher event: %s', event);
            listChildren(client, path);
        },
        function (error, children, stat) {
            if (error) {
                console.log('Failed to list children of %s due to: %s.',path,error);
                return;
            }
            console.log('Children of %s are: %j.', path, children);
        }
    );
}

function setData(client){
    console.log(data);
    client.setData(path, new Buffer(data), function (error, stat) {
        if (error) {
            console.log(error.stack);
            return;
        }
        console.log('Data is set.');
    });
}

function getData(client){
    client.getData(path,(event) => console.log('Got event: %s.', event), (error, data, stat) => {
        if (error) {
            console.log(error.stack);
            return;
        }
        console.log('Got data: %s', data.toString('utf8'));
    });
}

client.once("connected", () => {
    console.log("COnnected!");
    if(option == 1) create(client);
    if(option == 2) remove(client);
    if(option == 3) listChildren(client);
    if(option == 4) setData(client);
    if(option == 5) getData(client);
    client.close();
});

client.connect();
console.log(os.networkInterfaces());
const vscode = require('vscode');

function activate(context) {
    let disposable = vscode.commands.registerCommand('extension.generateTree', async function () {
        const inputText = await vscode.window.showInputBox({
            value: '',
            placeHolder: 'Paste AST',
        });
        // console.log(inputText);
        const panel = vscode.window.createWebviewPanel(
            'treeview', // Identifies the type of the webview. Used internally
            'AST Tree View', // Title of the panel displayed to the user
            vscode.ViewColumn.One, // Editor column to show the new webview panel in.
            {
                retainContextWhenHidden: true,
                enableScripts: true,
            }
        );

        function buildTree(obj, node, first) {
            if (!first) {
                var treeString = "<li><a>" + obj[node].value + "</a>";
            } else {
                var treeString = "";
            }
            var sons = [];
            for (var i in obj) {
                if (obj[i].parent == node)
                    sons.push(i);
            }
            if (sons.length > 0) {
                treeString += "<ul>";
                for (var i in sons) {
                    treeString += buildTree(obj, sons[i], false);
                }
                treeString += "</ul>";
            }
            return treeString;
        }

        class Tree {
            constructor(name, id, node) {
                this.name = name;
                this.id = id;
                this.node = node;
            }
        }

        class Leaf {
            constructor(name, id) {
                this.name = name;
                this.id = id;
            }
        }

        function parse(text) {
            function make_dict(tree, dict) {
                if (tree instanceof Tree) {
                    tree.node.forEach(n => {
                        dict[n.id] = { value: n.name, parent: tree.id };
                        make_dict(n, dict);
                    });
                }
            }

            var ast = { s: text, pos: 0 };
            var tree = getNode(ast, 0);

            var dict = { 'TOP': { value: "", parent: "" } };
            dict[tree.id] = { value: tree.name, parent: 'TOP' };
            make_dict(tree, dict);
            return dict;
        }

        function getNode(ast, id) {
            try {
                require(ast, '[');
                var tag = getTag(ast);
                skip_space(ast);
                var node = getInner(ast, `${id}`);
                skip_space(ast);
                require(ast, ']');
                return new Tree(tag, id, node);
            } catch (e) {
                console.error(e);
            }
        }

        function getInner(ast, id) {
            try {
                if (ast.s.slice(ast.pos).startsWith('\'')) {
                    return [getLeaf(ast, `${id}-0`)];
                } else if (ast.s.slice(ast.pos).startsWith('[')) {
                    var count = 0;
                    var node = [];
                    while (ast.s[ast.pos] != ']') {
                        var inner = getNode(ast, `${id}-${count}`);
                        node.push(inner);
                        count += 1;
                        skip_space(ast);
                    }
                    return node;
                } else {
                    throw new Error(`<PARSE ERROR> ${ast.s[ast.pos]} don't start with "'" or "["`);
                }
            } catch (e) {
                console.error(e);
            }
        }

        function getLeaf(ast, id) {
            require(ast, '\'');
            var lname = '';
            while (/[^']/.test(ast.s[ast.pos])) {
                lname += ast.s[ast.pos];
                ast.pos += 1;
            }
            require(ast, '\'')
            return new Leaf(lname, id)
        }

        function getTag(ast) {
            var tag = '';
            while (/[\w#]/.test(ast.s[ast.pos])) {
                tag += ast.s[ast.pos];
                ast.pos += 1;
            }
            return tag
        }

        function skip_space(ast) {
            while (/[ \n\t]/.test(ast.s[ast.pos])) {
                ast.pos += 1;
            }
        }

        function require(ast, target) {
            if (ast.s.slice(ast.pos).startsWith(target)) {
                ast.pos += target.length;
            } else {
                throw new Error(`<PARSE ERROR> pos:${ast.pos} don't match with ${target}`);
            }
        }

        var treeCode = buildTree(parse(inputText), 'TOP', true);
        panel.webview.html = getWebviewContent(treeCode);
    });

    context.subscriptions.push(disposable);
}
exports.activate = activate;

function getWebviewContent(treecode) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
    <style>
body{
    background:#fff;
    margin-left: 40px;
}
* {
  padding: 0;
}

.tree ul {
    padding-top: 20px;
    position: relative;

    transition: all 0.5s;
    -webkit-transition: all 0.5s;
    -moz-transition: all 0.5s;
}

.tree li {
    float: left;
    text-align: center;
    list-style-type: none;
    position: relative;
    padding: 20px 0px 0 5px;

    transition: all 0.5s;
    -webkit-transition: all 0.5s;
    -moz-transition: all 0.5s;
}

.tree li::before, .tree li::after{
    content: '';
    position: absolute; top: 0; right: 50%;
    border-top: 1px solid #545454;
    width: 50%; height: 20px;
}
.tree li::after{
    right: auto; left: 50%;
    border-left: 1px solid #545454;
}

.tree li:only-child::after, .tree li:only-child::before {
    display: none;
}

.tree li:only-child{ padding-top: 0;}

.tree li:first-child::before, .tree li:last-child::after{
    border: 0 none;
}

.tree li:last-child::before{
    border-right: 1px solid #545454;
    border-radius: 0 5px 0 0;
    -webkit-border-radius: 0 5px 0 0;
    -moz-border-radius: 0 5px 0 0;
}

.tree li:first-child::after{
    border-radius: 5px 0 0 0;
    -webkit-border-radius: 5px 0 0 0;
    -moz-border-radius: 5px 0 0 0;
}

.tree ul ul::before{
    content: '';
    position: absolute; top: 0; left: 50%;
    border-left: 1px solid #545454;
    width: 0; height: 20px;
}

.tree li a{
    border: 1px solid #545454;
    padding: 5px 10px;
    text-decoration: none;
    color: #333333;
    font-family: arial, verdana, tahoma;
    font-size: 14px;
    display: inline-block;

    border-radius: 5px;
    -webkit-border-radius: 5px;
    -moz-border-radius: 5px;

    transition: all 0.5s;
    -webkit-transition: all 0.5s;
    -moz-transition: all 0.5s;
}

.tree li a:hover, .tree li a:hover+ul li a {
    background: #c8e4f8;
    color: #000;
    border: 1px solid #94a0b4;
}

.tree li a:hover+ul li::after,
.tree li a:hover+ul li::before,
.tree li a:hover+ul::before,
.tree li a:hover+ul ul::before{
    border-color:  red;
}
    </style>
</head>
<body>
    <div id="tree_content">
        <div class="tree">
            ${treecode}
        </div>
    </div>
</body>
</html>`;
}


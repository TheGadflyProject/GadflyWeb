/*** @jsx React.DOM */
var Page = React.createClass({

    getInitialState: function() {
        var question_types = [{
                name: "Multiple Choice",
                url: "https://gadfly-api.herokuapp.com/api/multiple_choice_questions"
            }, {
                name: "Fill In The Blank",
                url: "https://gadfly-api.herokuapp.com/api/gap_fill_questions"
            }];

        return {
            articleURL: "",
            question_types: question_types,
            baseURL: "",
        };
    },

    updateArticleURL: function(newURL) {
        this.setState({articleURL: newURL});
    },

    render: function() {
        return (<div>
                    <div className="section">
                        <ArticleInput handleSubmit={this.updateArticleURL} />
                    </div>
                    <div className="divider"></div>
                    <div className="section">
                        <Article articleURL={this.state.articleURL} />
                    </div>
                    <div className="section">
                        <Dropdown list={this.state.question_types} selected={this.state.question_types[1]}/>
                    </div>
                    <div className="divider"></div>
                    <div className="section">
                        <div className="card-panel blue lighten-2">Displaying Questions for <a href={this.state.articleURL}>article</a>.</div>
                        <Questions baseURL={this.state.baseURL} articleURL={this.state.articleURL} />
                    </div>
                </div>);
    }
});

var Dropdown = React.createClass({
    getInitialState: function() {
        return {
        listVisible: false,
        display: ""
        };
    },

    select: function(item) {
        this.props.selected = item;
    },

    show: function() {
        this.setState({ listVisible: true });
        document.addEventListener("click", this.hide);
    },

    hide: function() {
        this.setState({ listVisible: false });
        document.removeEventListener("click", this.hide);
    },

    render: function() {
        return <div className={"dropdown-container" + (this.state.listVisible ? " show" : "")}>
        <div className={"dropdown-display" + (this.state.listVisible ? " clicked": "")} onClick={this.show}>
            <span>{this.props.selected.name}</span>
            <i className="fa fa-angle-down"></i>
        </div>
        <div className="dropdown-list">
            <div>
            {this.renderListItems()}
            </div>
        </div>
        </div>;
    },

    renderListItems: function() {
        var items = [];
        for (var i = 0; i < this.props.list.length; i++) {
        var item = this.props.list[i];
        items.push(<div onClick={this.select.bind(null, item)}>
            <span>{item.name}</span>
            <i className="fa fa-check"></i>
        </div>);
        }
        return items;
    }
});

var ArticleInput = React.createClass({

    getInitialState: function() {
        return {
            inputURL: "",
        };
    },

    handleSubmit: function(e) {
        e.preventDefault();
        this.props.handleSubmit(this.state.inputURL);
        this.setState({inputURL: ''});
    },

    handleInputChange: function(e) {
        this.setState({inputURL: e.target.value});
    },

    render: function() {
        return (
            <form onSubmit={this.handleSubmit}>
                <input type="text" id="article_url" onChange={this.handleInputChange} value={this.state.inputURL}></input>
                <label htmlFor="article_url">Article URL</label>
                <br />
                <input type="submit" value="Submit" className="btn" />
            </form>);
    }
});

var Article = React.createClass({
    getInitialState: function() {
        return {
            articleText: "",
            showArticle: "hide",
        }
    },

    toggleShowArticle: function() {
        if(this.state.showArticle == "hide") {
            this.setState({showArticle: "show"});
        } else {
            this.setState({showArticle: "hide"});
        }
    },

    componentWillReceiveProps: function() {
        var baseURL = "https://gadfly-api.herokuapp.com/api/article";
        this.setState({showArticle: "hide"},
            function() {
                $.ajax({
                    url: baseURL,
                    data: {
                        "url": this.props.articleURL,
                        },
                    dataType: 'text',
                    cache: false,
                    success: function(d) {
                        this.setState({articleText: d, loadingBar: "hide"});
                    }.bind(this),
                    error: function(xhr, status, err) {
                        console.error(this.props.url, status, err.toString());
                    }.bind(this)
                })
            }.bind(this)
        );
    },

    componentWillUnmount: function() {
        this.serverRequest.abort();
    },

    render: function() {
        return (
            <div>
            <a className="waves-effect waves-light btn" onClick={this.toggleShowArticle}>See Article</a>
            <div className={this.state.showArticle}>
                <a href={this.props.articleURL}>Go to Article</a>
                <p>{ this.state.articleText }</p>
            </div>
            </div>
        );
    }
});

var Questions = React.createClass({

    getInitialState: function() {
        return {
            loadingBar: "hide",
            qdata: [],
        }
    },

    componentWillReceiveProps: function() {
        var baseURL = "https://gadfly-api.herokuapp.com/api/multiple_choice_questions";
        this.setState({loadingBar: "show"},
            function() {
                $.ajax({
                    url: baseURL,
                    data: {
                        "url": this.props.articleURL,
                        },
                    dataType: 'json',
                    cache: false,
                    success: function(d) {
                        this.setState({qdata: d, loadingBar: "hide"});
                    }.bind(this),
                    error: function(xhr, status, err) {
                        console.error(this.props.url, status, err.toString());
                    }.bind(this)
                })
            }.bind(this)
        );
    },

    componentWillUnmount: function() {
        this.serverRequest.abort();
    },

    render: function() {
        if (this.state.qdata.questions != undefined) {
            var questionList = this.state.qdata.questions.map(
                    function(q) { return <Question question={q} />; }
                );
        }
        return (<table>
                    <thead>
                        <tr>
                            <th data-field="question">Question</th>
                            <th data-field="answer choices">Answer Choices</th>
                            <th data-field="answer">Answer</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <div className={this.state.loadingBar + " progress"}>
                                <div className="indeterminate"></div>
                            </div>
                        </tr>
                        {questionList}
                    </tbody>
                </table>);
    }
});

var Question = React.createClass({

    getInitialState: function() {
        return {}
    },

    render: function() {
        var answer_choices = this.props.question.answer_choices.map(
            (e, i) => (i + 1) + ") " + e + " "
        );
        return (<tr>
                    <td>{this.props.question.question}</td>
                    <td>{answer_choices}</td>
                    <td>{this.props.question.answer}</td>
                </tr>);
    }
});

React.render(<Page />, document.getElementById("mount-point"));
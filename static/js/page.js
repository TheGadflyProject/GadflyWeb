/*** @jsx React.DOM */
var Page = React.createClass({

    getInitialState: function() {

        return {
            articleURL: "",
            baseURL: "",
        };
    },

    updateArticleURL: function(newURL) {
        this.setState({articleURL: newURL});
    },

    componentDidMount: function() {
        $('.collapsible').collapsible({
            accordion : false // A setting that changes the collapsible behavior to expandable instead of the default accordion style
        });
        $('ul.tabs').tabs();  
    },

    render: function() {
        return (<div>
                    <div className="section">
                        <ArticleInput handleSubmit={this.updateArticleURL} />
                    </div>
                    <div className="section">
                        <ArticleTitle articleURL={this.state.articleURL} />
                        <ul className="tabs">
                            <li className="tab col s3"><a href="#article">Article</a></li>
                            <li className="tab col s3"><a href="#sent_segmentation">Segmentation</a></li>
                            <li className="tab col s3"><a href="#entities">Entities</a></li>
                            <li className="tab col s3"><a href="#mcq" className="active">Questions</a></li>
                        </ul>
                        <div>
                            <br />
                            <div id="article" className="col s12">
                                <Article articleURL={this.state.articleURL} />
                            </div>
                            <div id="sent_segmentation" className="col s12">
                                <Sentences baseURL={this.state.baseURL} articleURL={this.state.articleURL} />
                            </div>
                            <div id="entities" className="col s12">
                                <Entities baseURL={this.state.baseURL} articleURL={this.state.articleURL} />
                            </div>
                            <div id="mcq" className="col s12">
                                <Questions baseURL={this.state.baseURL} articleURL={this.state.articleURL} />
                            </div>
                        </div>
                    </div>
                </div>);
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
                <input type="text" id="article_url" onChange={this.handleInputChange} value={this.state.inputURL} placeholder="Paste a link to a news article to get started"></input>
                <label htmlFor="article_url">Article URL</label>
                <br />
                <input type="submit" value="Submit" className="btn indigo" />
            </form>);
    }
});

var ArticleTitle = React.createClass({
    getInitialState: function() {
        return {
            articleTitle: "",
            loadingBar: "hide",
        }
    },

    componentWillReceiveProps: function() {
        var baseURL = "https://gadfly-api.herokuapp.com/api/article_info";
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
                        console.log(d["article_info"]);
                        this.setState({articleTitle: d["article_info"], loadingBar: "hide"});
                    }.bind(this),
                    error: function(xhr, status, err) {
                        console.error(this.props.url, status, err.toString());
                    }.bind(this)
                });
            }.bind(this)
        );
    },

    componentWillUnmount: function() {
        this.serverRequest.abort();
    },

    render: function() {
        return (
            <h2>{this.state.articleTitle}</h2>
        );
    }
});



var Article = React.createClass({
    getInitialState: function() {
        return {
            articleText: "",
            loadingBar: "hide",
        }
    },

    componentWillReceiveProps: function() {
        var baseURL = "https://gadfly-api.herokuapp.com/api/article";
        this.setState({loadingBar: "show"},
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
                });
            }.bind(this)
        );
    },

    componentWillUnmount: function() {
        this.serverRequest.abort();
    },

    render: function() {
        return (
            <div className="row">
                <div className={this.state.loadingBar + " progress"}>
                    <div className="indeterminate"></div>
                </div>
                <div className="col sm12">
                    <a href={this.props.articleURL}>Go to Article</a>
                    <p className="flow-text">{ this.state.articleText }</p>
                </div>
            </div>
        );
    }
});

var Sentences = React.createClass({

    getInitialState: function() {
        return {
            loadingBar: "hide",
            sentences: [],
        }
    },

    componentWillReceiveProps: function() {
        var baseURL = "https://gadfly-api.herokuapp.com/api/sentences";
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
                        this.setState({sentences: d, loadingBar: "hide"});
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
        if (this.state.sentences.sents != undefined) {
            var sentenceList = this.state.sentences.sents.map(
                    function(s, i) {
                        console.log($.inArray(i, this.state.sentences.top_sent_idx));
                        if ($.inArray(i, this.state.sentences.top_sent_idx) > -1) {
                            return <li key={i} className="collection-item flow-text indigo darken-2 white-text">{s}</li>; 
                        }
                        return <li key={i} className="collection-item flow-text">{s}</li>;
                    }.bind(this)
                );
        }
        return (
            <div>
                <div className={this.state.loadingBar + " progress"}>
                    <div className="indeterminate"></div>
                </div>
                <ul className="collection">
                    { sentenceList }
                </ul>
            </div>);
    }
});

var Entities = React.createClass({

    getInitialState: function() {
        return {
            loadingBar: "hide",
            entities: [],
        }
    },

    componentWillReceiveProps: function() {
        var baseURL = "https://gadfly-api.herokuapp.com/api/entities";
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
                        this.setState({entities: d.entities, loadingBar: "hide"});
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
        if (this.state.entities != undefined) {
            var entitiesList = [];
            for (var ent in this.state.entities) {
                var tags = this.state.entities[ent].map(function(e, i){
                    return (<div key={i} className="chip">{e}</div>);
                }.bind(this));
                entitiesList.push(
                  <li key={ent} className="collection-item indigo-text">
                      {ent}
                      <div>{ tags }</div>
                  </li>)
            }
        }
        return (
            <div>
                <div className={this.state.loadingBar + " progress"}>
                    <div className="indeterminate"></div>
                </div>
                <ul className="collection">
                    { entitiesList }
                </ul>
            </div>);
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
                    function(q) {
                        return <Question question={q} />;
                    }
                );
        }
        return (<div>
                    <div className={this.state.loadingBar + " progress"}>
                        <div className="indeterminate"></div>
                    </div>
                    <div className="collection">
                        {questionList}
                    </div>
                </div>);
    }
});

var Question = React.createClass({

    getInitialState: function() {
        return {showAnswer: false, is_correct: "hide", is_not_correct: "hide"}
    },

    isRightAnswer: function(e) {
        if (e.target.id === this.props.question.answer) {
          this.setState({showAnswer: true, is_correct: "show", is_not_correct: "hide"});
        } else {
          this.setState({showAnswer: true, is_correct: "hide", is_not_correct: "show"});
        }
    },

    render: function() {
        var answer_choices = this.props.question.answer_choices.map(
            (e, i) => <div key={e} id={e} className="chip" onClick={this.isRightAnswer} >{(i + 1) + ") " + e + " "}</div>
        );
        return (<div className="collection-item">
                    {this.props.question.question}
                    <div className="row">
                      <div className="chips">{answer_choices}</div>
                    </div>
                    <div className="row">
                      <div className="col s2 m1">
                        <i className={this.state.is_correct + " small material-icons green-text"}>thumb_up</i>
                        <i className={this.state.is_not_correct + " small material-icons red-text"}>thumb_down</i>
                      </div>
                      <div className="col s10 m11">
                        <div className={this.state.is_correct + " chip indigo lighten-2 white-text"}>{this.props.question.answer}</div>
                      </div>
                    </div>
                </div>);
    }
});

React.render(<Page />, document.getElementById("mount-point"));

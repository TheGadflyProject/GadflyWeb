"use strict";

var Page = React.createClass({
    displayName: "Page",


    getInitialState: function getInitialState() {

        return {
            articleURL: "",
            baseURL: ""
        };
    },

    updateArticleURL: function updateArticleURL(newURL) {
        this.setState({ articleURL: newURL });
    },

    componentDidMount: function componentDidMount() {
        $('.collapsible').collapsible({
            accordion: false // A setting that changes the collapsible behavior to expandable instead of the default accordion style
        });
        $('ul.tabs').tabs();
    },

    render: function render() {
        return React.createElement(
            "div",
            null,
            React.createElement(
                "div",
                { className: "section" },
                React.createElement(ArticleInput, { handleSubmit: this.updateArticleURL })
            ),
            React.createElement(
                "div",
                { className: "section" },
                React.createElement(ArticleTitle, { articleURL: this.state.articleURL }),
                React.createElement(
                    "ul",
                    { className: "tabs" },
                    React.createElement(
                        "li",
                        { className: "tab col s3" },
                        React.createElement(
                            "a",
                            { href: "#mcq", className: "active" },
                            "Questions"
                        )
                    ),
                    React.createElement(
                        "li",
                        { className: "tab col s3" },
                        React.createElement(
                            "a",
                            { href: "#entities" },
                            "Entities"
                        )
                    ),
                    React.createElement(
                        "li",
                        { className: "tab col s3" },
                        React.createElement(
                            "a",
                            { href: "#sent_segmentation" },
                            "Segmentation"
                        )
                    ),
                    React.createElement(
                        "li",
                        { className: "tab col s3" },
                        React.createElement(
                            "a",
                            { href: "#article" },
                            "Article"
                        )
                    )
                ),
                React.createElement(
                    "div",
                    null,
                    React.createElement("br", null),
                    React.createElement(
                        "div",
                        { id: "mcq", className: "col s12" },
                        React.createElement(Questions, { baseURL: this.state.baseURL, articleURL: this.state.articleURL })
                    ),
                    React.createElement(
                        "div",
                        { id: "entities", className: "col s12" },
                        React.createElement(Entities, { baseURL: this.state.baseURL, articleURL: this.state.articleURL })
                    ),
                    React.createElement(
                        "div",
                        { id: "sent_segmentation", className: "col s12" },
                        React.createElement(Sentences, { baseURL: this.state.baseURL, articleURL: this.state.articleURL })
                    ),
                    React.createElement(
                        "div",
                        { id: "article", className: "col s12" },
                        React.createElement(Article, { articleURL: this.state.articleURL })
                    )
                )
            )
        );
    }
});

var ArticleInput = React.createClass({
    displayName: "ArticleInput",


    getInitialState: function getInitialState() {
        return {
            inputURL: ""
        };
    },

    handleSubmit: function handleSubmit(e) {
        e.preventDefault();
        this.props.handleSubmit(this.state.inputURL);
        this.setState({ inputURL: '' });
    },

    handleInputChange: function handleInputChange(e) {
        this.setState({ inputURL: e.target.value });
    },

    render: function render() {
        return React.createElement(
            "form",
            { onSubmit: this.handleSubmit },
            React.createElement("input", { type: "text", id: "article_url", onChange: this.handleInputChange, value: this.state.inputURL, placeholder: "Paste a link to a news article to get started" }),
            React.createElement(
                "label",
                { htmlFor: "article_url" },
                "Article URL"
            ),
            React.createElement("br", null),
            React.createElement("input", { type: "submit", value: "Submit", className: "btn indigo" })
        );
    }
});

var ArticleTitle = React.createClass({
    displayName: "ArticleTitle",

    getInitialState: function getInitialState() {
        return {
            articleTitle: "",
            loadingBar: "hide"
        };
    },

    componentWillReceiveProps: function componentWillReceiveProps() {
        var baseURL = "https://gadfly-api.herokuapp.com/api/article_info";
        this.setState({ loadingBar: "show" }, function () {
            $.ajax({
                url: baseURL,
                data: {
                    "url": this.props.articleURL
                },
                dataType: 'json',
                cache: false,
                success: function (d) {
                    console.log(d["article_info"]);
                    this.setState({ articleTitle: d["article_info"], loadingBar: "hide" });
                }.bind(this),
                error: function (xhr, status, err) {
                    console.error(this.props.url, status, err.toString());
                }.bind(this)
            });
        }.bind(this));
    },

    componentWillUnmount: function componentWillUnmount() {
        this.serverRequest.abort();
    },

    render: function render() {
        return React.createElement(
            "h2",
            null,
            this.state.articleTitle
        );
    }
});

var Article = React.createClass({
    displayName: "Article",

    getInitialState: function getInitialState() {
        return {
            articleText: "",
            loadingBar: "hide"
        };
    },

    componentWillReceiveProps: function componentWillReceiveProps() {
        var baseURL = "https://gadfly-api.herokuapp.com/api/article";
        this.setState({ loadingBar: "show" }, function () {
            $.ajax({
                url: baseURL,
                data: {
                    "url": this.props.articleURL
                },
                dataType: 'text',
                cache: false,
                success: function (d) {
                    this.setState({ articleText: d, loadingBar: "hide" });
                }.bind(this),
                error: function (xhr, status, err) {
                    console.error(this.props.url, status, err.toString());
                }.bind(this)
            });
        }.bind(this));
    },

    componentWillUnmount: function componentWillUnmount() {
        this.serverRequest.abort();
    },

    render: function render() {
        return React.createElement(
            "div",
            { className: "row" },
            React.createElement(
                "div",
                { className: this.state.loadingBar + " progress" },
                React.createElement("div", { className: "indeterminate" })
            ),
            React.createElement(
                "div",
                { className: "col sm12" },
                React.createElement(
                    "a",
                    { href: this.props.articleURL },
                    "Go to Article"
                ),
                React.createElement(
                    "p",
                    { className: "flow-text" },
                    this.state.articleText
                )
            )
        );
    }
});

var Sentences = React.createClass({
    displayName: "Sentences",


    getInitialState: function getInitialState() {
        return {
            loadingBar: "hide",
            sentences: []
        };
    },

    componentWillReceiveProps: function componentWillReceiveProps() {
        var baseURL = "https://gadfly-api.herokuapp.com/api/sentences";
        this.setState({ loadingBar: "show" }, function () {
            $.ajax({
                url: baseURL,
                data: {
                    "url": this.props.articleURL
                },
                dataType: 'json',
                cache: false,
                success: function (d) {
                    this.setState({ sentences: d, loadingBar: "hide" });
                }.bind(this),
                error: function (xhr, status, err) {
                    console.error(this.props.url, status, err.toString());
                }.bind(this)
            });
        }.bind(this));
    },

    componentWillUnmount: function componentWillUnmount() {
        this.serverRequest.abort();
    },

    render: function render() {
        if (this.state.sentences.sents != undefined) {
            var sentenceList = this.state.sentences.sents.map(function (s, i) {
                console.log($.inArray(i, this.state.sentences.top_sent_idx));
                if ($.inArray(i, this.state.sentences.top_sent_idx) > -1) {
                    return React.createElement(
                        "li",
                        { key: i, className: "collection-item flow-text indigo darken-2 white-text" },
                        s
                    );
                }
                return React.createElement(
                    "li",
                    { key: i, className: "collection-item flow-text" },
                    s
                );
            }.bind(this));
        }
        return React.createElement(
            "div",
            null,
            React.createElement(
                "div",
                { className: this.state.loadingBar + " progress" },
                React.createElement("div", { className: "indeterminate" })
            ),
            React.createElement(
                "ul",
                { className: "collection" },
                sentenceList
            )
        );
    }
});

var Entities = React.createClass({
    displayName: "Entities",


    getInitialState: function getInitialState() {
        return {
            loadingBar: "hide",
            entities: []
        };
    },

    componentWillReceiveProps: function componentWillReceiveProps() {
        var baseURL = "https://gadfly-api.herokuapp.com/api/entities";
        this.setState({ loadingBar: "show" }, function () {
            $.ajax({
                url: baseURL,
                data: {
                    "url": this.props.articleURL
                },
                dataType: 'json',
                cache: false,
                success: function (d) {
                    this.setState({ entities: d.entities, loadingBar: "hide" });
                }.bind(this),
                error: function (xhr, status, err) {
                    console.error(this.props.url, status, err.toString());
                }.bind(this)
            });
        }.bind(this));
    },

    componentWillUnmount: function componentWillUnmount() {
        this.serverRequest.abort();
    },

    render: function render() {
        if (this.state.entities != undefined) {
            var entitiesList = [];
            for (var ent in this.state.entities) {
                var tags = this.state.entities[ent].map(function (e, i) {
                    return React.createElement(
                        "div",
                        { key: i, className: "chip" },
                        e
                    );
                }.bind(this));
                entitiesList.push(React.createElement(
                    "li",
                    { key: ent, className: "collection-item indigo-text" },
                    ent,
                    React.createElement(
                        "div",
                        null,
                        tags
                    )
                ));
            }
        }
        return React.createElement(
            "div",
            null,
            React.createElement(
                "div",
                { className: this.state.loadingBar + " progress" },
                React.createElement("div", { className: "indeterminate" })
            ),
            React.createElement(
                "ul",
                { className: "collection" },
                entitiesList
            )
        );
    }
});

var Questions = React.createClass({
    displayName: "Questions",


    getInitialState: function getInitialState() {
        return {
            loadingBar: "hide",
            qdata: []
        };
    },

    componentWillReceiveProps: function componentWillReceiveProps() {
        var baseURL = "https://gadfly-api.herokuapp.com/api/multiple_choice_questions";
        this.setState({ loadingBar: "show" }, function () {
            $.ajax({
                url: baseURL,
                data: {
                    "url": this.props.articleURL
                },
                dataType: 'json',
                cache: false,
                success: function (d) {
                    this.setState({ qdata: d, loadingBar: "hide" });
                }.bind(this),
                error: function (xhr, status, err) {
                    console.error(this.props.url, status, err.toString());
                }.bind(this)
            });
        }.bind(this));
    },

    componentWillUnmount: function componentWillUnmount() {
        this.serverRequest.abort();
    },

    render: function render() {
        if (this.state.qdata.questions != undefined) {
            var questionList = this.state.qdata.questions.map(function (q) {
                return React.createElement(Question, { question: q });
            });
        }
        return React.createElement(
            "div",
            null,
            React.createElement(
                "div",
                { className: this.state.loadingBar + " progress" },
                React.createElement("div", { className: "indeterminate" })
            ),
            React.createElement(
                "div",
                { className: "collection" },
                questionList
            )
        );
    }
});

var Question = React.createClass({
    displayName: "Question",


    getInitialState: function getInitialState() {
        return { showAnswer: false, is_correct: "hide", is_not_correct: "hide" };
    },

    isRightAnswer: function isRightAnswer(e) {
        if (e.target.id === this.props.question.answer) {
            this.setState({ showAnswer: true, is_correct: "show", is_not_correct: "hide" });
        } else {
            this.setState({ showAnswer: true, is_correct: "hide", is_not_correct: "show" });
        }
    },

    componentWillReceiveProps: function componentWillReceiveProps() {
        this.setState({ showAnswer: false, is_correct: "hide", is_not_correct: "hide" });
    },

    render: function render() {
        var _this = this;

        var answer_choices = this.props.question.answer_choices.map(function (e, i) {
            return React.createElement(
                "div",
                { key: e, id: e, className: "chip", onClick: _this.isRightAnswer },
                i + 1 + ") " + e + " "
            );
        });
        return React.createElement(
            "div",
            { className: "collection-item" },
            this.props.question.question,
            React.createElement(
                "div",
                { className: "row" },
                React.createElement(
                    "div",
                    { className: "chips" },
                    answer_choices
                )
            ),
            React.createElement(
                "div",
                { className: "row" },
                React.createElement(
                    "div",
                    { className: "col s2 m1" },
                    React.createElement(
                        "i",
                        { className: this.state.is_correct + " small material-icons green-text" },
                        "thumb_up"
                    ),
                    React.createElement(
                        "i",
                        { className: this.state.is_not_correct + " small material-icons red-text" },
                        "thumb_down"
                    )
                ),
                React.createElement(
                    "div",
                    { className: "col s10 m11" },
                    React.createElement(
                        "div",
                        { className: this.state.is_correct + " chip indigo lighten-2 white-text" },
                        this.props.question.answer
                    )
                )
            )
        );
    }
});

React.render(React.createElement(Page, null), document.getElementById("mount-point"));
import React, { Component } from 'react';
import logo from './General_AWScloud.svg';
import './App.css';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import questions from "./questions.json";

/**
 * This class handles presentation of a single category.
 */
class Category extends Component {
  constructor(props) {
    super(props);

    this.category = props.category;

    this.state = this.createState();
    
    this.boundHandleKeyUp = this.handleKeyUp.bind(this);
  }

  /**
   * Create the model.
   */
  createState() {
    let question = this.category.questions[this.category.current];
    return {
      showAnswer: false,
      questionText: question.q,
      answer: question.a,
      reference: question.r,
      current: this.category.current + 1,
      total: this.category.questions.length,
      name: this.category.fullName
    };
  }

  /**
   * Show the answer.
   */
  handleShowClick() {
    let state = this.createState();
    state.showAnswer = true;
    this.setState(state);
  }

  /**
   * Go to the next question, or the first question if we reached the end.
   */
  handleNextClick() {
    let question = this.category.questions[this.category.current];
    question.viewed = true;
    if (this.category.current === this.category.questions.length - 1) {
      this.category.current = 0;
    }
    else {
      this.category.current += 1;
    }
    this.setState(this.createState());
  }

  /**
   * Advance on Space or Enter.
   */
  handleKeyUp(e) {
    console.info("e.key", e.key);
    if (e.key === "Enter" || e.key === " " || e.key === "ArrowRight") {
      if (this.state.showAnswer) {
        this.handleNextClick();
      }
      else {
        this.handleShowClick();
      }
    }
  }

  componentWillMount() {
    document.addEventListener("keyup", this.boundHandleKeyUp);
  }

  componentWillUnmount() {
    document.removeEventListener("keyup", this.boundHandleKeyUp);
  }

  /**
   * Render a question.
   */
  render() {

    let showAnswerClass = this.state.showAnswer ? '' : 'hidden-answer';

    return (
      <div>
          <div className="current-total">
            {this.state.name} Question {this.state.current} of {this.state.total}
          </div>
          <h2>{this.state.questionText}</h2>
          
          <div className={this.state.showAnswer ? 'hidden-button' : ''}>
            <button onClick={() => this.handleShowClick()}>Show Answer</button>
          </div>
          
          
          <div className={showAnswerClass}>
            <div className='answer-box'> 
              <h2>{this.state.answer}</h2>
            </div>
            
            <button onClick={() => this.handleNextClick()}>Next</button>
          
            <div className="question-ref"><a href={this.state.reference}>{this.state.reference}</a></div>
          </div>
        </div>
    );
  }
}

/**
 * Read a questions file and replace questions.json.
 */
class FileInput extends React.Component {
    constructor(props) {
      super(props);
      this.uploadFile = this.uploadFile.bind(this);
      this.onLoadQuestions = props.onLoadQuestions;
      console.info('onLoadQuestions', this.onLoadQuestions);
    }
    
    uploadFile(event) {
        let file = event.target.files[0];
        console.log(file);
        var self = this;
        
        if (file) {
          
          const fileReader = new FileReader();
          
          fileReader.onload = function(loadEvent) {
              const fileText = loadEvent.target.result;
              
              //console.log(fileText);
          
              const newQuestions = JSON.parse(fileText);
              
              if (!newQuestions.questions) {
                console.log("Missing questions");
              } else {
                console.log(`Loaded ${newQuestions.questions.length} questions`);
                self.onLoadQuestions(newQuestions);
              }
          };
          
          fileReader.readAsText(file);
          
        }
    }
    
    render() {
      return <span>
        <input type="file"
        name="myFile"
        onChange={this.uploadFile} />
      </span>
    }
}

/**
 * Renders the top-level category panels.
 */
class App extends Component {
  constructor(props) {
    super(props);

    this.state = this.createState(questions);
    this.loadQuestions = this.loadQuestions.bind(this);
  }
  
  loadQuestions(newQuestions) {
    this.setState(this.createState(newQuestions)); 
  }
    
  createState(questions) {
  
    const state = { 
      questions: questions.questions,
      categoryNames: [],
      categories: {}
    };

    // Create a dictionary of category names to questions
    for (let i = 0; i < state.questions.length; i++) {
      let q = state.questions[i];

      if (q.q === "") {
        continue;
      }

      // Add a few properties to questions to help manage state
      q.viewed = false;
      q.showAnswer = false;

      // Add the ALL category
      let cats = q.c;
      cats.push("ALL");
      
      let fullNames = {
        "ALL": "All",
        "S3": "Simple Storage Service",
        "EC2": "Elastic Compute Cloud",
        "CW": "Cloud Watch",
        "VPC": "Virtual Private Cloud",
        "EBS": "Elastic Block Store",
        "RDS": "Relational Database Service",
        "IAM": "Identity and Access Management",
        "SQS": "Simple Queue Service",
        "R53": "Route 53",
        "CF": "Cloud Formation",
        "ECS": "EC2 Container Service",
        "L": "Lambda",
        "EBK": "Elastic Beanstalk",
        "OPS": "Ops Works",
        "CT": "CloudTrail",
        "PR": "Tier 2 Speaker Cert"
      };
      
      const getFullName = function(name) {
        let fn = fullNames[name];
        if (!fn) {
          fn = name;
        }
        return fn;
      };

      for (let j = 0; j < cats.length; j++) {
        let categoryName = cats[j];
        if (!state.categories[categoryName]) {
          state.categoryNames.push(categoryName);
          state.categories[categoryName] = {
            "name": categoryName,
            "fullName": getFullName(categoryName),
            "questions": [],
            "current": 0
          };
        }
        state.categories[categoryName].questions.push(q);
      }

    }

    // Shuffle the questions in each category
    for (let i = 0; i < state.categoryNames.length; i++) {
      let categoryName = state.categoryNames[i];
      this.shuffle(state.categories[categoryName].questions);
    }
    
    return state;
  }

  /**
   * Shuffles array in place. ES6 version.
   * https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
   * @param {Array} a items An array containing the items.
   */
  shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  renderPanel(categoryName) {
    let category = this.state.categories[categoryName];

    return (
      <TabPanel key={categoryName}>
        <Category category={category} />
      </TabPanel>
    );
  }

  render() {

    var self = this;

    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">AWS Certification Flash Cards</h1>
        </header>
        
        <div id="category-tabs">
          <Tabs>
            <TabList>
            {
              this.state.categoryNames.map(function(name) {
                let cct = self.state.categories[name].questions.length;
                return (
                  <Tab key={name}>
                    <div className="tab-name">{name}
                      <sub>{cct}</sub>
                    </div></Tab>
                );
              })
            }
              <Tab>?</Tab>
            </TabList>
        
            {
              this.state.categoryNames.map(function(name) {
                  return self.renderPanel(name);
              })
            }
            
            <TabPanel>
              <h2>Help</h2>
              <div className="help-topics">
                <ul>
                  <li>You can use &lt;Enter&gt;, &lt;Space&gt;, and &lt;RightArrow&gt; to show the answer and move to the next question.
                      </li>
                  <li>Ping ezbeard if you spot an error or you have a question you would like to add.</li>
                  <li><FileInput onLoadQuestions={this.loadQuestions} /></li>
                </ul>
              </div>
            </TabPanel>
            
          </Tabs>
        </div>
      </div>
    );
  }
}

export default App;

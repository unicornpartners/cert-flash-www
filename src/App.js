import React, { Component } from 'react';
import logo from './General_AWScloud.svg';
import './App.css';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import questions from "./questions.json";

class Category extends Component {
    constructor(props) {
      super(props);
      
      this.category = props.category;
      
      this.state = this.createState();
    }
    
    createState() {
      let question = this.category.questions[this.category.current];
      return {
        showAnswer: false,
        questionText: question.q,
        answer: question.a,
        reference: question.r
      };
    }
    
    handleShowClick() {
      let state = this.createState();
      state.showAnswer = true;
      this.setState(state);
    }
      
    handleNextClick() {
      let question = this.category.questions[this.category.current];
      question.viewed = true;
      if (this.category.current === this.category.questions.length - 1) {
        this.category.current = 0;
      } else {
        this.category.current += 1;
      }
      this.setState(this.createState());
    }
    
    render() {
      return (
        <div>
          <h2>{this.state.questionText}</h2>
          <button onClick={() => this.handleShowClick()}>Show Answer</button>
          
          <div className={this.state.showAnswer ? '': 'hidden-answer'}>
            <h2>{this.state.answer}</h2>
            
            <button onClick={() => this.handleNextClick()}>Next</button>
          
            <div className="question-ref"><a href="{question.r}">{this.state.reference}</a></div>
          </div>
        </div>
      );
    }
}

class App extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      questions: questions.questions,
      categoryNames: [],
      categories: {}
    };
    
    // Create a dictionary of category names to questions
    for (let i = 0; i < this.state.questions.length; i++) {
      let q = this.state.questions[i];
      
      // Add a few properties to questions to help manage state
      q.viewed = false;
      q.showAnswer = false;
      
      // Add the ALL category
      let cats = q.c;
      cats.push("ALL");
      
      for (let j = 0; j < cats.length; j++) {
        let categoryName = cats[j];
        if (!this.state.categories[categoryName]) {
          this.state.categoryNames.push(categoryName);
          this.state.categories[categoryName] = {
            "questions": [],
            "current": 0
          };
        }
        this.state.categories[categoryName].questions.push(q);
      }
    }
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
                return <Tab key={name}>{name}</Tab>;
              })
            }
            </TabList>
        
            {
              this.state.categoryNames.map(function(name) {
                  return self.renderPanel(name);
              })
            }
            
          </Tabs>
        </div>
      </div>
    );
  }
}

export default App;

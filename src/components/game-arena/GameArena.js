import React, { Component } from "react";

import { ImageCanvas } from "./image-canvas/ImageCanvas";

import config from "../../../config";

export class GameArena extends React.Component {
  constructor(props) {
    super(props);
    this.getImage = this.getImage.bind(this);
    this.getWord = this.getWord.bind(this);
    this.checkAnswer = this.checkAnswer.bind(this);
    this.state = {
      imageUrl: null,
      answer: "",
      timer: 10,
      score: 0
    };
  }

  componentDidMount() {
    this.getWord();
  }

  // retrieves random word from wordnik API
  getWord() {
    // the higher the number, the more common the word
    let corpusCount = 800000;
    fetch(
      `https://api.wordnik.com/v4/words.json/randomWord?hasDictionaryDef=true&includePartOfSpeech=noun&minCorpusCount=${corpusCount}&maxDictionaryCount=-1&minLength=2&maxLength=10&api_key=${
        config.WORDNIK_API_KEY
      }`
    )
      .then(res => res.json())
      .then(res => {
        this.setState(
          {
            answer: res.word.toLowerCase()
          },
          console.log(res.word)
        ); // used for testing

        return this.getImage(res.word);
      });
  }

  // given searchTerm retrieves image from flickr API
  getImage(searchTerm) {
    // possibly use text argument instead of tags
    // first get results from search
    fetch(
      `https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=${
        config.FLICKR_API_KEY
      }&tags=${searchTerm}&format=json&nojsoncallback=true`
    )
      .then(res => res.json())
      .then(res => {
        // grab first result
        let firstResultId = res.photos.photo[0].id;
        // retrieves image sizes
        return fetch(
          `https://api.flickr.com/services/rest/?method=flickr.photos.getSizes&api_key=${
            config.FLICKR_API_KEY
          }&photo_id=${firstResultId}&format=json&nojsoncallback=1`
        );
      })
      .then(res => res.json())
      .then(res => {
        let imageSizes = res.sizes.size;
        let image = imageSizes.find(
          size => size.label === "Medium" || size.label === "Original"
        );
        let imageUrl = image.source;
        this.setState({
          imageUrl
        });

        // once image is loaded, begin counting down
        this.timer = setInterval(() => {
          if (this.state.timer > 0) {
            this.setState({
              timer: this.state.timer - 1
            });
          }
        }, 1000);
      });
  }

  // compares user input with the answer
  checkAnswer(event) {
    // get new word if input matches
    if (event.target.value.toLowerCase() == this.state.answer) {
      // when answer is correct, stop timer and increment score accordingly
      clearInterval(this.timer);
      this.setState({
        score: this.state.score + this.state.timer * 100 + 500,
        timer: 10
      });
      this.getWord();
      event.target.value = "";
    }
  }

  render() {
    return (
      <div className="section">
        <div className="has-text-centered is-size-3">
          Score: {this.state.score}
        </div>
        <div className="container">
          {this.state.imageUrl ? (
            <ImageCanvas url={this.state.imageUrl} />
          ) : null}
        </div>
        <div className="columns is-centered is-marginless">
          <div className="column is-half">
            <input
              className="input is-medium"
              type="text"
              placeholder="type here"
              onChange={this.checkAnswer}
            />
          </div>
        </div>
      </div>
    );
  }
}

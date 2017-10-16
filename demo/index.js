import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { compose } from 'recompose';

const applyUpdateResult = (result) => prevState => ({
  hits: [...prevState.hits, ...result.hits],
  page: result.page,
  isLoading: false,
})

const applyResult = (result) => (prevState) => ({
  hits: result.hits,
  page: result.page,
  isLoading: false,
})

const getHackerNewsUrl = (value, page) =>
  `https://hn.algolia.com/api/v1/search?query=${value}&page=${page}&hitsPerPage=100`;

export default class Demo extends  Component{
  constructor(props){
    super(props);
    this.state = {
      page: null,
      hits: [],
      isLoading: false,
    }
    this.onInitialSearch = this.onInitialSearch.bind(this);
    this.onSetResult = this.onSetResult.bind(this);
    this.fetchStories = this.fetchStories.bind(this);
    this.onPaginatedSearch = this.onPaginatedSearch.bind(this);
  }

  onInitialSearch(e){
    e.preventDefault();

    console.log(e.target.value,"tadamm",this.input.value)
    const { value } = this.input;
    if (value === '') return;
    this.fetchStories(value,0)
  }

  fetchStories (value, page) {
    this.setState({
      isLoading: true,
    })
    console.log(value,page)
    fetch(getHackerNewsUrl(value, page))
      .then( response => response.json())
      .then( result => this.onSetResult(result, page) )
  }

  onPaginatedSearch(value,page){
    this.fetchStories(this.input.value,this.state.page+1)
  }

  onSetResult(result, page){
    console.log(result,'res')
    page === 0
      ? this.setState(applyResult(result))
      : this.setState(applyUpdateResult(result))
  }

  render (){
    //return <div>Hello</div>
    return (
      <div className='page'>
        <div className='interactions'>
          <form type='submit' onSubmit={this.onInitialSearch}>
            <input type="text" ref={node=>this.input = node}/>
            <button type="submit">Search</button>
          </form>
        </div>
        <ListWithLoadingWithPaginated
          list={this.state.hits}
          page={this.state.page}
          onPaginatedSearch={this.onPaginatedSearch}
          isLoading={this.state.isLoading}
        />

      </div>
    );
  }
}

const List = ({ list,page,onPaginatedSearch,isLoading }) =>{
  console.log(list)
  return (
  <div>
    <div className='list'>
      {
        list.map(  item => {
          return (
            <div className = 'list-row' key = { item.objectID }>
              <a href ={item.url} >{item.title}</a>
            </div>
          )
        })
      }
    </div>
  </div>
)
}

// Let!s use HOCs

const withLoading = (Component) => (props) =>
  <div>
    <Component {...props} />
    <div className='interactions'>
      {props.isLoading && <span>Loading...</span>}
    </div>
  </div>

const withPaginated = (Component) => (props) =>
  <div>
    <Component {...props} />
    <div className='interactions'>
    {
      (props.page !== null && !props.isLoading) &&
      <button
        type="button"
        onClick = {props.onPaginatedSearch}
      >
        More
      </button>
    }
    </div>
  </div>

const ListWithLoadingWithPaginated = compose(
  withPaginated,
  withLoading,
)(List);

ReactDOM.render(<Demo/>,document.querySelector('#content'))

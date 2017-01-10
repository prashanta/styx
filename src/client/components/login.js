/*jshint esversion: 6 */

import React  from 'react';

export default class Layout extends React.Component{

    constructor(props) {
        super(props);
    }

    componentDidMount(){
        console.log('Component did mount');
    }

    render(){
        return (
            <div>
                Login here
            </div>
        );
    }
}

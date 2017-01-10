/*jshint esversion: 6 */

import React  from 'react';
import Header  from './header';

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
                <div>Settings</div>
            </div>
        );
    }
}

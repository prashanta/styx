/*jshint esversion: 6 */

import React  from 'react';
import {Navbar, Nav, NavItem, Button} from 'react-bootstrap';

export default class Header extends React.Component{

    constructor(props) {
        super(props);
    }

    render(){
        return (
            <div>
                <Navbar>
                    <Nav pullRight>
                        <NavItem><Button><i className="fa fa-cogs" aria-hidden="true"></i></Button></NavItem>
                    </Nav>
                </Navbar>
            </div>
        );
    }
}

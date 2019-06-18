import React from 'react';
import { Col, Container, Row, Card, CardBody } from 'reactstrap';
import { translate } from 'react-i18next';
import PropTypes from 'prop-types';
import { connect } from "react-redux";
import { compose } from 'lodash/fp'
import { InputField, DropDownField, CalendarInputField } from '../../components/Input';
import { UserNetworkIcon, CompanyIcon, CropPortraitIcon, BookLockIcon, UserStarIcon, SignTextIcon, CalendarIcon, MoneyIcon, QuestionAnswerIcon } from 'mdi-react';
import APISingleton from '../../controllers/API';
import NumberFormat from 'react-number-format';
import { Button } from '@material-ui/core';
import Numbers from '../../services/numbers';
import _ from 'lodash';
import { auctionStatusArray } from '../Auctions/containers/codes';
import StringWorkerSingleton from '../../services/string';
import { MenuItem } from '@material-ui/core';

const logo = `${process.env.PUBLIC_URL}/img/logo.png`;


const defaultProps = {
    validators : [],
    companies : [],
    clients : [],
    validator_fee : 0,
    fee_percentage : 0.01,
    state : 'Waiting for approval',
    total_paid : 0,
    company : {},
    auction_address : '0x'
}



function NumberFormatCustom(props) {
    const { inputRef, onChange, ...other } = props;

    return (
        <NumberFormat
        {...other}
        getInputRef={inputRef}
        onValueChange={values => {
            onChange({
            target: {
                value: values.value,
            },
            });
        }}
        thousandSeparator
        prefix="$"
        />
    );
}

let editables = ['state']

function isEditable(type){
    let index = editables.indexOf(new String(type).toLowerCase());
    return index > -1 ? true : false;
}

class EditAuction extends React.Component{

    constructor(props){
        super(props)
        this.state = {...defaultProps}
    }

    componentDidMount(){
        this.projectData(this.props)
    }

    componentWillReceiveProps(props){
        this.projectData(props);
    }

    projectData = (props) => {
        let { profile } = props;
        let editableAuction = profile.getEditableAuction();
        this.setState({...this.state, 
            ...editableAuction,
            isEdit : true,
            validators : APISingleton.getAllByType('validator'),
            companies : APISingleton.getAllByType('company'),
            clients   : APISingleton.getAllByType('client')
        })
    }

    edit = async () => {
        const { profile } = this.props;
        let auction = APISingleton.getAuctionByAuctionAddress(this.state.auction_adress);
        await profile.editAuction({...auction, ...this.state});
        // Clean State
        this.state = null;
        this.props.history.push(`/${new String(profile.getType()).toLowerCase()}/auctions`);
    }

    
    onChange = ({type, value}) => {
        var validator_fee = this.state.validator_fee;
        if((type == 'payment_amount') && (value > 0)){
                validator_fee = Numbers.toFloat(value*this.state.fee_percentage);
        }
        this.setState({...this.state, [type] : value, validator_fee})
    }


    render = () => {
        if(_.isEmpty(this.props.profile)){return null};
        if(!this.props.profile.isEditing()){return null}
        if(!this.state.isEdit){return null}

        return (
            <Container className="dashboard">
                <Card>
                    <CardBody style={{padding : 50}}>
                        <Row>
                            <Col lg={4}>
                                <h4> Auction </h4>
                                <img src={logo} style={{marginTop : 40, width : 200}} alt="" className="topbar__button-icon" />
                            </Col>
                        </Row>
                        <Row>
                            <Col lg={4}>
                            <div style={{marginTop : 20}}>
                                    <CompanyIcon className='icon-left'/>
                                    <InputField
                                        id="name"
                                        value={this.state.pba_name}
                                        type={'pba_name'}
                                        disabled={!isEditable('pba_name')}
                                        onChange={this.onChange}
                                        style={{width : '80%'}}
                                        label="PBA Name"
                                        placeholder="Energy Auction"
                                    /> 
                                </div> 
                            </Col> 
                            <Col lg={4}>
                                <div style={{marginTop : 20}}>
                                    <CropPortraitIcon className='icon-left'/>
                                    <InputField
                                        id="name"
                                        type={'workpackage_name'}
                                        onChange={this.onChange}
                                        value={this.state.workpackage_name}
                                        disabled={!isEditable('workpackage_name')}
                                        style={{width : '80%'}}
                                        label="WorkPackage Name"
                                        placeholder="Workpackage name"
                                    /> 
                                </div>   
                            </Col>
                            <Col lg={4}>
                                <div style={{marginTop : 20}}>
                                    <QuestionAnswerIcon className='icon-left'/>
                                    <DropDownField
                                        id="state"
                                        type={'state'}
                                        value={new String(this.state.state).toLowerCase()}
                                        disabled={!isEditable('state')}
                                        onChange={this.onChange}
                                        options={auctionStatusArray}
                                        style={{width : '80%'}}
                                        label="Status of Auction"
                                        >
                                        {auctionStatusArray.map(option => (
                                            <MenuItem key={new String(option).toLowerCase()} value={new String(option).toLowerCase()}>
                                                {option}
                                            </MenuItem>
                                        ))}
                                        </DropDownField> 
                                </div>
                            </Col>
                        </Row>
                        <hr></hr>
                        <Row>
                            <Col lg={4}>
                                <div style={{marginTop : 20}}>
                                    <SignTextIcon className='icon-left'/>
                                    <InputField
                                        id="name"
                                        type={'auction_name'}
                                        value={this.state.auction_name}
                                        disabled={!isEditable('auction_name')}
                                        onChange={this.onChange}
                                        style={{width : '80%'}}
                                        label="Auction Name"
                                        placeholder="Auction Auction"
                                        
                                    /> 
                                </div>
                            </Col>
                            <Col lg={4}>
                                <div style={{marginTop : 20}}>
                                    <MoneyIcon className='icon-left'/>
                                    <InputField
                                        id="payment_amount"
                                        type={'payment_amount'}
                                        value={this.state.payment_amount}
                                        disabled={!isEditable('payment_amount')}
                                        onChange={this.onChange}
                                        InputProps={{
                                            inputComponent: NumberFormatCustom,
                                          }}
                                        style={{width : '80%'}}
                                        label="Payment Amount"
                                    /> 
                                </div>
                            </Col>
                            <Col lg={4}>
                                <div style={{marginTop : 20}}>
                                    <MoneyIcon className='icon-left'/>
                                    <InputField
                                        id="validator_fee"
                                        type={'validator_fee'}
                                        onChange={this.onChange}
                                        disabled
                                        placeholder={this.state.validator_fee}
                                        value={this.state.validator_fee}
                                        InputProps={{
                                            inputComponent: NumberFormatCustom,
                                        }}
                                        style={{width : '80%'}}
                                        label="Validator Fee"
                                    /> 
                                </div>
                            </Col>
                        </Row>
                        <Row>
                            <Col lg={4}>
                                <div style={{marginTop : 20}}>
                                    <CompanyIcon className='icon-left'/>
                                    <DropDownField
                                        id="company"
                                        helperText={'Choose the Company Name'}
                                        type={'company'}
                                        value={this.state.company.address}
                                        disabled={!isEditable('company')}
                                        onChange={this.onChange}
                                        options={this.state.companies}
                                        style={{width : '80%'}}
                                        label="Company Name"                                        
                                        >
                                        {this.state.companies.map(option => (
                                            <MenuItem key={option.address} value={option.address}>
                                                {option.name} ({ StringWorkerSingleton.toAddressConcat(option.address) })
                                            </MenuItem>
                                        ))}
                                        </DropDownField> 
                                </div>
                            </Col>
                            <Col lg={4}>
                                <div style={{marginTop : 20}}>
                                    <BookLockIcon className='icon-left'/>
                                    <DropDownField
                                        id="validator"
                                        helperText={'Choose the Validator Name'}
                                        type={'validator'}
                                        value={this.state.validator.address}
                                        disabled={!isEditable('validator')}
                                        onChange={this.onChange}
                                        options={this.state.validators}
                                        style={{width : '80%'}}
                                        label="Validator Name"
                                    >
                                        {this.state.validators.map(option => (
                                            <MenuItem key={option.address} value={option.address}>
                                                {option.name} ({ StringWorkerSingleton.toAddressConcat(option.address) })
                                            </MenuItem>
                                        ))}
                                        </DropDownField> 
                                </div>
                            </Col>
                            <Col lg={4}>
                                <div style={{marginTop : 20}}>
                                    <UserStarIcon className='icon-left'/>
                                    <DropDownField
                                        id="client"
                                        helperText={'Choose the Client Name'}
                                        type={"client"}
                                        value={this.state.client.address}
                                        disabled={!isEditable('client')}
                                        onChange={this.onChange}
                                        options={this.state.clients}
                                        style={{width : '80%'}}
                                        label="Client Name"
                                        >
                                        {this.state.clients.map(option => (
                                            <MenuItem key={option.address} value={option.address}>
                                                {option.name} ({ StringWorkerSingleton.toAddressConcat(option.address) })
                                            </MenuItem>
                                        ))}
                                        </DropDownField> 
                                </div>
                            </Col>
                        </Row>
                        <Row>
                            <Col lg={4}>
                                <div style={{marginTop : 20}}>
                                    <CalendarIcon className='icon-left'/>
                                    <CalendarInputField
                                        id="calendar"
                                        type={"start_date"}
                                        value={this.state.start_date}
                                        disabled={!isEditable('start_date')}
                                        onChange={this.onChange}
                                        options={this.state.clients}
                                        style={{width : '80%'}}
                                        label="Start Date"
                                    /> 
                                </div>
                            </Col>
                            <Col lg={4}>
                                <div style={{marginTop : 20}}>
                                    <CalendarIcon className='icon-left'/>
                                    <CalendarInputField
                                        id="calendar"
                                        type={"end_date"}
                                        value={this.state.end_date}
                                        disabled={!isEditable('end_date')}
                                        onChange={this.onChange}
                                        options={this.state.clients}
                                        style={{width : '80%'}}
                                        label="End Date"
                                    /> 
                                </div>
                            </Col>
                            <Col lg={4}>
                                <div style={{marginTop : 20}}>
                                    <CalendarIcon className='icon-left'/>
                                    <CalendarInputField
                                        id="calendar"
                                        type={"pay_date"}
                                        disabled={!isEditable('pay_date')}
                                        onChange={this.onChange}
                                        value={this.state.pay_date}
                                        options={this.state.clients}
                                        style={{width : '80%'}}
                                        label="Pay Date"
                                    /> 
                                </div>
                            </Col>
                        </Row>
                        <Row>
                            <Col lg={12}>
                                <Button 
                                    onClick={() => this.edit()} variant="contained" color="primary" className={'button-enter'}>
                                        Confirm Editing 
                                </Button>       
                            </Col>
                        </Row>
                    </CardBody>
                </Card>
            </Container>
        )
    }
}

function mapStateToProps(state){
    return {
        profile: state.profile
    };
}

EditAuction.propTypes = {
    t: PropTypes.func.isRequired
};


export default compose(
    translate('common'),
    connect(mapStateToProps)
)(EditAuction);


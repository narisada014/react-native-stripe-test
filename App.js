import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Button,
  Modal,
  TouchableHighlight,
  TextInput,
  Alert
} from 'react-native';
import axios from 'axios';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modal: false,
      number: '',
      month: '',
      year: '',
      cvc: '',
      stripe_token: "tok_visa"
    }
  }

  setModalVisible(state) {
    this.setState({modal: state});
  }

  getStripeToken() {
    const cardDetails = {
      "card[number]": this.state.number,
      "card[exp_month]": Number(this.state.month),
      "card[exp_year]": Number(this.state.year),
      "card[cvc]": this.state.cvc
    };

    const Params = Object.keys(cardDetails).map((key) => {
      return encodeURIComponent(key) + '=' + encodeURIComponent(cardDetails[key]);
    }).join('&');

    axios({
      method: 'post',
      headers: {
        'Authorization': "Bearer 'シークレットキー'",
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      url: 'https://api.stripe.com/v1/tokens',
      data: Params
    })
      .then((response) => {
        //this.setState({ stripe_token: response.data.id });
        Alert.alert(
          'トークンを取得しました',
          JSON.stringify(response.data.id),
          [
            {text: 'OK', onPress: () => console.log('OK Pressed')},
          ],
        )

        this.createCustomer();
      })

      .catch((error) => {
        alert(error);
      })
  }

  createCustomer() {
    axios({
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      url: 'http://localhost:3000/stripe/create_client',
      data: { stripe_token: this.state.stripe_token }
    })
      .then((response) => {
        if (response.data.success) {
          Alert.alert(
            'カードが登録されました',
            '',
            [
              {text: 'OK', onPress: () => console.log('OK Pressed')},
            ],
          )
        }
      })

      .catch((error) => {
        alert(error);
      })
  }

  render() {
    return (
      <View style={styles.container}>

        <Button
          title="カード番号を入力する"
          onPress={() => this.setModalVisible(true)}
          color="#841584"
        />

        <Modal
          animationType="fade"
          transparent={false}
          visible={this.state.modal}
          onRequestClose={() => {
            alert('Modal has been closed.');
          }}>
          <View style={styles.container}>
            <View>
              <TextInput
                style={{height: 40}}
                placeholder="111111111111"
                onChangeText={(number) => this.setState({number})}
              />
              <TextInput
                style={{height: 40}}
                placeholder="頭の0は抜いて入力してください"
                onChangeText={(month) => this.setState({month})}
              />
              <TextInput
                style={{height: 40}}
                placeholder="2023"
                onChangeText={(year) => this.setState({year})}
              />
              <TextInput
                style={{height: 40}}
                placeholder="777"
                onChangeText={(cvc) => this.setState({cvc})}
              />
              <Button
                title="送信する"
                onPress={() => this.getStripeToken()}
                color="#841584"
              />
              <TouchableHighlight
                onPress={() => {
                  this.setModalVisible(!this.state.modal);
                }}>
                <Text>戻る</Text>
              </TouchableHighlight>
            </View>
          </View>
        </Modal>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  }
});

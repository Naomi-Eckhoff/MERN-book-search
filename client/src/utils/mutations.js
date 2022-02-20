import { gql } from '@apollo/client';

export const LOGIN_USER = gql`
  mutation login($username: String, $email: String, $password: String!) {
    login(username: $username, email: $email, password: $password) {
      token
      user {
        _id
        username
        email
      }
    }
  }
`;

export const ADD_USER = gql`
  mutation createUser($username:String!, $email:String!, $password: String!){
    addUser(username: $username, email:$email, password:$password) {
      token
      user {
        _id
        username
        email
      }
    }
  }
`;
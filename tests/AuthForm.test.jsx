import React from 'react';
import { render, screen } from '@testing-library/react';

export default function AuthForm(){
  return (<div data-testid="auth-form">Auth Form</div>);
}

test('renders auth form', ()=>{
  render(<AuthForm/>);
  expect(screen.getByTestId('auth-form')).toBeTruthy();
});

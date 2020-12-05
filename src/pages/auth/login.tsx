import { Button } from '@paljs/ui/Button';
import { InputGroup } from '@paljs/ui/Input';
import React, { useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Auth from 'components/Auth';
import Layout from 'Layouts';

import Alert from '@paljs/ui/Alert';

import { Form } from '@unform/web';
import Input from '../../components/Form/Input';
import * as Yup from 'yup';
import axios from 'axios';

// import { Checkbox } from '@paljs/ui/Checkbox';
// import Link from 'next/link';
// import Socials from 'components/Auth/Socials';

export default function Login() {
  const formRef = useRef(null);
  const router = useRouter();
  const [isAuth, setAuth] = useState(false);

  async function handleSubmit(data: any) {
    formRef.current.setErrors({});

    try {
      const schema = Yup.object().shape({
        email: Yup.string().required('E-mail é obrigatório'),
        senha: Yup.string().required('Senha é obrigatório'),
      });

      await schema.validate(data, {
        abortEarly: false,
      });

      let loginResult = await axios
        .post(`${process.env.STRAPI_API_URL}/auth/local`, {
          identifier: data.email,
          password: data.senha,
        })
        .then((response) => {
          localStorage.setItem('jwt', response.data.jwt);
          localStorage.setItem('user', JSON.stringify(response.data.user));

          axios.post(
            `${process.env.STRAPI_API_URL}/logs`,
            {
              acao: 'login',
              user: response.data.user.id,
            },
            {
              headers: {
                Authorization: `Bearer ${response.data.jwt}`,
              },
            },
          );

          router.push('/atendimento');
        })
        .catch((e) => {
          setAuth(true);
          setTimeout(() => setAuth(false), 2500);
          return;
        });

      // if (loginResult.jwt != undefined) {
      // }

      // if(data.email != initialData.email || data.senha != initialData.senha){
      //   setAuth(true);
      //   setTimeout(() => setAuth(false), 2500);
      //   return;
      // }else{
      //   router.push('/atendimento');
      // }

      // const query = qs.stringify({
      //     _where: {
      //         //  created_at_gt: new Date(utcDate.getTime() - 60 * 60 * 24 * 1000).toISOString(), VERIFICA SE USUÁRIO JA FEZ O RESGATE NAS ULTIMAS 24H
      //         aprovado: true,
      //          _or: [
      //            {email: data.email},
      //            {telefone: data.telefone}
      //          ]
      //      }
      //  });

      //  let hasParticipied;

      //  await fetch(`${process.env.API_URL}/participantes/count?${query}`, {
      //     method: 'GET',
      //     headers: {
      //         'Content-Type': 'application/json',
      //     }
      // })
      // .then(response => response.json())
      // .then(data => hasParticipied = data);

      // if(hasParticipied > 0){
      //     setBrind(true);
      //     setLoading(false);
      //     setTimeout(() => setBrind(false), 4000);
      //     return;
      // }

      // fetch(`${process.env.API_URL}/participantes`, {
      //     method: 'POST',
      //     headers: {
      //         'Content-Type': 'application/json',
      //     },
      //     body: JSON.stringify(data),
      // })
      // .then(response => response.json())
      // .then(data => {
      //     // console.log(data);
      //     // reset();
      //     router.push({pathname: '/calling', query: router.query})
      // });
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        const errorMessages = {};

        err.inner.forEach((error: any) => {
          errorMessages[error.path] = error.message;
        });

        formRef.current.setErrors(errorMessages);
        // setLoading(false);
      } else {
        console.warn(err);
      }
    }
  }

  return (
    <Layout title="Login">
      <Auth title="Login" subTitle="Faça seu login, com as credenciais enviadas anteriormente">
        {isAuth == true && <Alert status={'Danger'}>Login ou senha inválido.</Alert>}

        <Form ref={formRef} onSubmit={handleSubmit}>
          <InputGroup fullWidth>
            <Input name="email" type="email" placeholder="E-mail" />
          </InputGroup>
          <InputGroup fullWidth>
            <Input name="senha" type="password" placeholder="Senha" />
          </InputGroup>
          {/* <Group>
            <Checkbox checked onChange={onCheckbox}>
              Remember me
            </Checkbox>
            <Link href="/auth/request-password">
              <a>Forgot Password?</a>
            </Link>
          </Group> */}
          <Button
            status="Success"
            type="button"
            shape="SemiRound"
            fullWidth
            onClick={() => formRef.current.submitForm()}
          >
            Login
          </Button>
        </Form>
      </Auth>
    </Layout>
  );
}

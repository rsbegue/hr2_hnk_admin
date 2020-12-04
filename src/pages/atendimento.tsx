import React, { useState, useEffect, useRef, useReducer } from 'react';
import Layout from 'Layouts';
import Row from '@paljs/ui/Row';
import Col from '@paljs/ui/Col';
import { List, ListItem } from '@paljs/ui/List';
import { Card } from '@paljs/ui/Card';
import User from '@paljs/ui/User';

import { Button } from '@paljs/ui/Button';
import io from 'socket.io-client';
import axios from 'axios';

const qs = require('qs');

const initialUsers: { name: string; title: string; id: number; status: number; room: string }[] = [];

const socket = io('https://heineken.eracell.com.br/', {
  transports: ['websocket'],
});

const ListParent = ({ list }) => {
  function windowsOpen(id: number, room: string, status: number) {
    // changeStatus(id, status);
    let ua = JSON.parse(localStorage.getItem('user') || '{}').id;
    window.open(
      `${process.env.API_URL}/view?room=${room}&ua=${ua}`,
      'sharer',
      'toolbar=0,status=0,width=1280,height=1024',
    );
  }

  return (
    <List>
      {list.map((item) => (
        <ListItem key={item.id}>
          <Row style={{ width: '100%' }}>
            <Col breakPoint={{ lg: 4 }}>
              <User title={item.title} name={item.name} />
            </Col>

            <Col breakPoint={{ lg: 2 }} offset={{ md: 6 }}>
              {item.status == 0 && (
                <Button appearance={'outline'} status={'Warning'} onClick={() => windowsOpen(item.id, item.room, 1)}>
                  ATENDER
                </Button>
              )}
              {item.status == 1 && (
                <Button appearance={'outline'} status={'Danger'} onClick={() => changeStatus(item.id, 2)}>
                  ENCERRAR
                </Button>
              )}
            </Col>
          </Row>
        </ListItem>
      ))}
    </List>
  );
};

const listReducer = (state, action) => {
  console.log(action);
  switch (action.type) {
    case 'ADD_ITEM':
      return {
        ...state,
        list: state.list.concat({
          name: action.data.nome,
          title: 'M:' + action.data.machine.idMachine + ' - ' + action.data.email + ' | ' + action.data.telefone,
          id: action.data.id,
          status: 0,
          room: action.data.sala,
        }),
      };
    default:
      throw new Error();
  }
};

const Home = () => {
  const [disponivel, setDisponivel] = useState(true);
  const [listData, dispatchListData] = React.useReducer(listReducer, {
    list: initialUsers,
    isShowList: true,
  });

  const socketRef = useRef();

  useEffect(() => {
    socketRef.current = io.connect('https://heineken.eracell.com.br/');

    socketRef.current.on('ligacaoRecebida', handleLigacaoRecebida);

    // socketRef.current.on('ligacaoEncerrada', handleLigacaoEncerrada);

    // socketRef.current.on('ligacaoAtendida', handleLigacaoAtendida);
  }, []);

  async function handleLigacaoRecebida(payload: { room: any }) {
    const query = qs.stringify({
      _where: {
        sala: payload.room,
      },
    });

    let result = await axios.get(`${process.env.STRAPI_API_URL}/participantes?${query}`);

    if (result.data.length > 0) {
      let data = result.data[0];
      dispatchListData({ type: 'ADD_ITEM', data });

      if (disponivel) {
        alert('LIGAÇÃO RECEBIDA: ' + data.nome);
        setDisponivel(false);
      }
    }
  }

  // function handleLigacaoEncerrada(payload: any){
  //   dispatchList({ type: 'REMOVE_ITEM', payload });
  // }

  function changeStatus(id: number, status: number) {
    const newUser = users.map((user) => {
      if (user.id === id) {
        const updatedUser = {
          ...user,
          status: status,
        };

        return updatedUser;
      }

      return user;
    });

    setUsers(newUser);
  }

  return (
    <Layout title="Atendimento">
      <Row>
        <Col breakPoint={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
          <Card size="Giant">
            <header>Atendimentos </header>
            {/* ({list.length}) */}
            {/* {
              list.length == 0 &&
              <h6 style={{textAlign:'center'}}>Nenhum atendimento em andamento</h6>
            } */}
            <ListParent list={listData.list} />
          </Card>
        </Col>
      </Row>
    </Layout>
  );
};
export default Home;

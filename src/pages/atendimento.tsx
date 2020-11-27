import React, { useState, useEffect } from 'react';
import Layout from 'Layouts';
import Row from '@paljs/ui/Row';
import Col from '@paljs/ui/Col';
import { List, ListItem } from '@paljs/ui/List';
import { Card } from '@paljs/ui/Card';
import User from '@paljs/ui/User';
// import styled, { css } from 'styled-components';
// import { breakpointUp } from '@paljs/ui/breakpoints';
import { Button } from '@paljs/ui/Button';

// import qs from 'qs';

const qs = require('qs');


// interface BoxProps {
//   nested?: boolean;
//   container?: boolean;
//   row?: boolean;
//   large?: boolean;
// }

// const Box = styled.div<BoxProps>`
//   ${({ theme, nested, container, row, large }) => css`
//     position: relative;
//     box-sizing: border-box;
//     min-height: 1rem;
//     overflow: hidden;
//     text-align: center;
//     background: ${theme.colorBasic600};
//     padding: 0.75rem 0.25rem;
//     border-radius: 0.25rem;
//     ${large && 'height: 8rem;'};
//     ${row && 'margin-bottom: 1rem  !important;'};
//     ${container && 'padding: .5em;'};
//     ${nested && `background-color: ${theme.colorBasic200};`};
//     ${breakpointUp('md')`
//       padding: 1rem;
//     `}
//   `}
// `;

const API_URL = "https://heineken.eracell.com.br";
const STRAPI_API_URL = "https://strapi.heineken.eracell.com.br";

const initialUsers: { name: string, title: string, id: number, status: number, room: string }[] = [];

const Home = () => {
  const [users, setUsers] = useState(initialUsers);
  // const [reload, setReload] = useState(true);
  const [calls, setCall] = useState([]);

  useEffect(() => {
    getAtendimentos();

    const interval = setInterval(() => {
      getAtendimentos();
    }, 1000 * 5);

    return ()=>clearInterval(interval);
  }, []);


  useEffect(() => {

    if(calls.length == 0){
      setUsers([]);
    }else{

      

      let salas = [];

      for (const call in calls) {
        if (Object.prototype.hasOwnProperty.call(calls, call)) {
          // const element = calls[call];
          salas.push(call);
        }
      }

      console.log('salas', salas);

      const query = qs.stringify({
        _where: {
          sala: salas
        }
      });

      fetch(`${STRAPI_API_URL}/participantes?${query}`, {
          method: 'GET',
          headers: {
              'Content-Type': 'application/json',
          }
      })
      .then(response => response.json())
      .then(data => {

        console.log(data);

        data.map((item: any) => {

          let checkUser = users.filter(user => (user.id == item.id));
          if(checkUser.length == 0){
            users.push({ 
              name: item.nome, 
              title: 'M:'+item.machine.idMachine+' - '+ item.email +' | ' + item.telefone,
              id: item.id,
              status: 0,
              room: item.sala
            });
          }

        });

        
      });
    }

  }, [calls]);

  const getAtendimentos = async () => {
    await fetch(`${API_URL}/atendimentos`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => setCall(data));
  };

  let userList = users.filter((user) => {
    return user.status < 2;
  });

  function windowsOpen(id: number, room: string, status: number){
    changeStatus(id, status);
    window.open('https://heineken.eracell.com.br/view?room='+room, 'sharer', 'toolbar=0,status=0,width=1280,height=1024');
  }

  function changeStatus(id: number, status: number){
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
            <header>Atendimentos</header>
            {
              userList.length > 0 &&
              <List>
                {userList.map((user, index) => (
                  <ListItem key={index}>
                    <Row style={{ width: '100%' }}>
                      <Col breakPoint={{ lg: 4 }}>
                        <User title={user.title} name={user.name} />
                      </Col>
                    
                      <Col breakPoint={{ lg: 2 }} offset={{ md: 6}} >
                        {
                          user.status == 0 &&
                          <Button appearance={"outline"} status={"Warning"} onClick={() => windowsOpen(user.id, user.room, 1)}>
                            ATENDER
                          </Button>
                        }
                        {
                          user.status == 1 &&
                          <Button appearance={"outline"} status={"Danger"} onClick={() => changeStatus(user.id, 2)}>
                            ENCERRAR
                          </Button>
                        }
                      </Col>
                    </Row>
                  </ListItem>
                ))}
              </List>
            }
            
          </Card>
        </Col>
      </Row>
    </Layout>
  );
};
export default Home;

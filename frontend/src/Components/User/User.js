import React from 'react';
import { Route, Routes } from "react-router-dom";
import { UserContext } from "../../UserContext";
import Head from '../Helper/Head';
import NotFound from '../NotFound';
import UserHeader from './UserHeader';
import Aluno from './../Aluno/Aluno';
import Professor from './../Professor/Professor';
import Equipamento from './../Equipamento/Equipamento';
import Ficha from './../Ficha/Ficha';
import Exercicio from './../Exercicio/Exercicio';
import UserAccount from './UserAccount';

const User = () => {
    const { data } = React.useContext(UserContext);

    return (
        <section className="container">
            <Head title = "Minha Conta" />
            <UserHeader />
            <Routes>
                <Route path="/" element={<UserAccount/>} />
                <Route path="aluno" element={ <Aluno /> } />
                <Route path="professor" element={<Professor/>} />
                <Route path="equipamento" element={<Equipamento/>} />
                <Route path="ficha" element={<Ficha/>} />
                <Route path="exercicio" element={<Exercicio/>} />
                <Route path="*" element={<NotFound/>} />
            </Routes>
        </section>
    );
};

export default User;
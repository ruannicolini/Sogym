import React from 'react';
import styles from './ModalForm.module.css';
import Error from './Error';

const ModalForm = ({children, modalForm, setModalForm, error, handleSalvarClick, loadModalData}) => {

    React.useEffect( () => {
        loadModalData && loadModalData();
    }, []);

    function handleOutsideClick({target, currentTarget}){
		if(target === currentTarget){
            setModalForm(null);
		}
	}
    
    return (
        <div className={styles.modal} onClick={handleOutsideClick}>
            <div className={styles.modalWrapper}>

                <div className={styles.dataWrapper}>

                    <div className={styles.modalSectionWrapper}>
                        <h2>{modalForm}</h2>
                    </div>

                    <div className={styles.modalSectionWrapper}>
                        {children}
                        {error && <Error error={error} />}
                    </div>
                    
                    <div className={styles.buttonsWrapper}> 
                        <button onClick={handleOutsideClick}>cancelar</button>
                        <button onClick={handleSalvarClick} >Salvar</button>
                    </div>
                </div>
                
            </div>
            
		</div>
    );
};

export default ModalForm;
import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import CloseIcon from '@mui/icons-material/Close';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    textAlign: 'center'
};

function SavedModal(props) {
    return (
        <Modal
            open={props.open}
            onClose={props.handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style}>
                <Typography id="modal-modal-title" variant="h4" component="h2">
                    Your Page has been saved
                </Typography>
                <Typography id="modal-modal-description" variant='h6' component='h4'>
                    You can use this link to share the page with your friends
                </Typography>
                <br />
                <a style={{ fontSize: '25px' }} href={window.location.href}>{window.location.href}</a>
                <div id="modal-close" onClick={props.handleClose}>
                    <CloseIcon className='close-icon' />
                </div>
                <br />
                <br />
                <Button style={{ backgroundColor: 'gray', color: 'red' }} onClick={props.handleClose}>Close</Button>
            </Box>
        </Modal >
    )
}

export default SavedModal
